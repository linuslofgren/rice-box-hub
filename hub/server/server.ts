import { sendToSocket } from "./socket.ts";
import { DisplacementJob, Operation, Passthrough, WebSocketMessage } from "./types.ts";

const PORT = 8080;

const server = Deno.listen({ port: PORT });

const sockets: { [key: string]: WebSocket } = {};

const createCalculateDisplacementJob = (operation: Operation, jobId?: string): DisplacementJob => 
  async () => {
      return { configuration: await sendToSocket(operation), jobId}
  }

export const hubServer = async (
  addToRedis: (job: DisplacementJob) => void,
  broadcastIterator: () => AsyncGenerator
) => {

  for await (const conn of server) {
    (async () => {
      const httpConn = Deno.serveHttp(conn);
      for await (const reqEvent of httpConn) {
        if (!reqEvent) continue;

        const { socket, response } = Deno.upgradeWebSocket(reqEvent.request);
        const uuid = crypto.randomUUID();

        socket.onopen = async () => {
          sockets[uuid] = socket;
          for await(const result of broadcastIterator()){
            if(socket.readyState === WebSocket.OPEN) {
                console.log('[WebSocket Server] Broadcasting: ', result)
                socket.send(JSON.stringify(result))
            } else {
              return // Kill this itererator when socket is closed
            }
          }
        };

        socket.onmessage = (e) => {
          const message: WebSocketMessage = JSON.parse(e.data);
          console.log("[WebSocket Server] Got", message, "on websocket");
          for (const [id, connection] of Object.entries(sockets)) {
            if (id == uuid) continue;
            connection.send(e.data);
          }
          if(message.passthrough) {
            const displacementJob = createCalculateDisplacementJob(
                { passthrough: message.passthrough }, 
                (message as unknown as Passthrough & { jobId?: string }).jobId
            );
            addToRedis(displacementJob)
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
