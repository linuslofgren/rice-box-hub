import { Configuration, Operation, WebSocketMessage } from "./types.ts";
import { sendToSocket } from "./socket.ts";

const PORT = 8080;

const server = Deno.listen({ port: PORT });

const sockets: { [key: string]: WebSocket } = {};

const calculateDisplacement = async (
  args: Operation,
): Promise<Configuration> => {
  const result = await sendToSocket(args);
  return result;
};

const createCalculateDisplacementJob = (args: Operation) => {
  const calc = async () => {
    return await calculateDisplacement(args);
  };
  return calc;
};
export const hubServer = async (
  add: (jobs: () => Promise<Configuration>) => void,
) => {
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
          if (message.position_update) {
            for (const [id, connection] of Object.entries(sockets)) {
              if (id == uuid) continue;
              connection.send(JSON.stringify(message.position_update));
            }
          } else {
            const displacement = createCalculateDisplacementJob(
              message as Operation,
            );
            add(displacement);
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
