export const sendToSocket = async (
  data: Record<string, unknown>,
  name = "ris.sock",
) => {
  console.log("Sending on socket to JULIA");

  const conn = await Deno.connect({ path: name, transport: "unix" });
  await conn.write(new TextEncoder().encode(JSON.stringify(data)));
  const decoder = new TextDecoder();
  const b = new Uint8Array(1024);
  const n = await conn.read(b);
  const resp = JSON.parse(
    decoder.decode(b.subarray(0, n == null ? undefined : n)),
  );
  conn.close();
  return resp;
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
