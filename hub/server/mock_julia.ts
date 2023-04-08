import { clearSocket } from "./socket.ts";
import { Operation } from "./types.ts";

export const MockJuliaSocket = async () => {
  await clearSocket("ris.sock");
  const listener = Deno.listen({ transport: "unix", path: "ris.sock" });
  for await (const conn of listener) {
    console.log("[JULIA MOCK] Received on socket");
    const buf = new Uint8Array(1024);
    const n = await conn.read(buf);
    const data = new TextDecoder().decode(
      buf.subarray(0, n == null ? undefined : n),
    );

    const operation: Operation = JSON.parse(data);

    let displacement = Array(10).fill(0);

    if (operation.angle) {
      console.log("[JULIA MOCK] Calculating displacement by angel");
      displacement = displacement.map((d, i) => i % 4);
    } else if (operation.couple) {
      console.log("[JULIA MOCK] Calculating displacement for coupling");
      displacement = displacement.map((d, i) => i + 100);
    } else if (operation.focus) {
      console.log("[JULIA MOCK] Calculating displacement for focus");
      displacement = displacement.map((d, i) => Math.abs(5 - i));
    }
    const response = JSON.stringify(displacement);

    const responseBytes = new TextEncoder().encode(response);
    await conn.write(responseBytes);
    conn.close();
  }
};

MockJuliaSocket();
