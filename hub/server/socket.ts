import { Configuration } from "./types.ts";

export const sendToSocket = async (
  data: Record<string, unknown>,
  name = "../../positioning/socket/ris.sock",
): Promise<Configuration> => {
  console.info("[JULIA] Sending on socket to JULIA");
  let conn;
  try {
    conn = await Deno.connect({ path: name, transport: "unix" });
  } catch (error) {
    console.error(error);
    return []
  }
  await conn.write(new TextEncoder().encode(JSON.stringify(data)+'\n'));
  console.info("[JULIA] Sent");
  
  const decoder = new TextDecoder();
  const b = new Uint8Array(1024);
  console.info("[JULIA] Awaiting read...");
  const n = await conn.read(b);
  const data_tr = decoder.decode(b.subarray(0, n == null ? undefined : n))
  console.info("[JULIA], got data", data_tr);

  const resp = JSON.parse(
    data_tr
  );
  conn.close();
  console.info("[JULIA] Finished sending to JULIA");
  return resp.configuration;
};

export const singleEchoSocketServer = async () => {
  const listener = Deno.listen({ transport: "unix", path: "ris.sock" });
  const data = await handleConnection(await listener.accept());
  listener.close();
  return data;
};

export const echoSocketServer = async () => {
  const listener = Deno.listen({ transport: "unix", path: "ris.sock" });
  for await (const conn of listener) {
    await handleConnection(conn);
  }
};

export const singleJuliaMockSocketServer = async () => {
  const listener = Deno.listen({ transport: "unix", path: "ris.sock" });
  const data = await handleConnection(
    await listener.accept(),
    JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
  );
  listener.close();
  return data;
};

const handleConnection = async (
  conn: Deno.Conn,
  response: string | null = null,
) => {
  const buf = new Uint8Array(1024);
  const n = await conn.read(buf);
  const data = new TextDecoder().decode(
    buf.subarray(0, n == null ? undefined : n),
  );
  const responseBytes = new TextEncoder().encode(
    response == null ? data : response,
  );
  await conn.write(responseBytes);
  conn.close();

  return data;
};

export const clearSocket = async (name: string) => {
  const rm = Deno.run({
    cmd: ["rm", name],
    cwd: "./",
    stdout: "null",
    stderr: "null",
  });
  await rm.status();
  rm.close();
};
