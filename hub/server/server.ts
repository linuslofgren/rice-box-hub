import { sendToSocket } from "./socket.ts";
import { DisplacementJob, ObjectPositions, Operation, Passthrough, WebSocketMessage } from "./types.ts";

const PORT = 8080;

const server = Deno.listen({ port: PORT });

const sockets: { [key: string]: WebSocket } = {};

const createCalculateJob = (operation: Operation, jobId?: string) : DisplacementJob => 
  async () => {
      return { configuration: await sendToSocket(operation), jobId}
  }

const startLoop = async (iterator: () => AsyncGenerator) => {
  for await(const result of iterator()){
    let num = 0
    for(const [id, socket] of Object.entries(sockets)) {
      if(socket.readyState === WebSocket.OPEN) {
        num++
        console.log(`[WebSocket Server] Broadcasting: `, result)
        socket.send(JSON.stringify(result))
      } else {
        // nothing
      }
    }
    console.log('Broaded to num: ', num)
  }
}

export const hubServer = async (
  addToRedis: (job: DisplacementJob) => void,
  broadcastIterator: () => AsyncGenerator
) => {
  startLoop(broadcastIterator)
  for await (const conn of server) {
    (async () => {
      const httpConn = Deno.serveHttp(conn);
      for await (const reqEvent of httpConn) {
        if (!reqEvent) continue;

        const { socket, response } = Deno.upgradeWebSocket(reqEvent.request);
        const uuid = crypto.randomUUID();

        socket.onopen = () => {
          sockets[uuid] = socket;
        };

        socket.onmessage = (e) => {
          const message: WebSocketMessage = JSON.parse(e.data);
          console.log("[WebSocket Server] Got", message, "on websocket");
          for (const [id, connection] of Object.entries(sockets)) {
            if (id == uuid || connection.readyState !== WebSocket.OPEN) continue;
            connection.send(e.data);
          }
          if(message.passthrough) {
            const displacementJob = createCalculateJob(
                { passthrough: message.passthrough }, 
                (message as unknown as Passthrough & { jobId?: string }).jobId
            );
            addToRedis(displacementJob)
          } else if(message.ris) {
            const mess = (message as unknown) as ObjectPositions & { jobId?: string}
            const { jobId, ...withoutId } = mess 
            const job = createCalculateJob({ couple: withoutId }, jobId)
            addToRedis(job)
          }
        };
        socket.onclose = () => {
          delete sockets[uuid];
          console.log("[WebSocket Server]", "Closed", uuid);
        };
        socket.onerror = (e) => {
          console.error("[WebSocket Server]", e);
        };

        reqEvent.respondWith(response);
      }
    })();
  }
};
