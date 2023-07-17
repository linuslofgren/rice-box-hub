import { sendToSocket } from "./socket.ts";
import { DisplacementJob, Operation, Passthrough, WebSocketMessage } from "./types.ts";

const PORT = 8080;

const server = Deno.listen({ port: PORT });

const sockets: { [key: string]: WebSocket } = {};

const createCalculateDisplacementJob = (operation: Operation, jobId?: string): DisplacementJob => 
  async () => {
      return { configuration: await sendToSocket(operation), jobId}
  }

export const hubServer = async <ToWebData>(
  addToRedis: (job: DisplacementJob) => void,
  toWebIterator: () => AsyncGenerator<ToWebData>
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
          for await(const result of toWebIterator()){
            if(socket.readyState === WebSocket.OPEN) {
                console.log('[WebSocket Server] Sending to web: ', result)
                socket.send(JSON.stringify(result))
            } else {
              return // Kill this itererator when socket is closed
            }
          }
        };

        socket.onmessage = (e) => {
          const message: WebSocketMessage = JSON.parse(e.data);
          console.log("[WebSocket Server] Got", message, "on websocket");
          if (message.position_update) {
            for (const [id, connection] of Object.entries(sockets)) {
              if (id == uuid) continue;
              connection.send(JSON.stringify(message.position_update));
            }
          } else if(message.passthrough) {
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
