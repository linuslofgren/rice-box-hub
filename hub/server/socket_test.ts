import {
  clearSocket,
  sendToSocket,
  singleJuliaMockSocketServer,
} from "./socket.ts";
import { sleep } from "https://deno.land/x/sleep@v1.2.1/mod.ts";
import { assertEquals } from "https://deno.land/std@0.182.0/testing/asserts.ts";

Deno.test("Socket", async (t) => {
  const SOCKET_NAME = "ris.sock";

  await clearSocket(SOCKET_NAME);

  await t.step("Send to socket", async () => {
    const data = { angle: 45 };
    const [_, response] = await Promise.all([
      singleJuliaMockSocketServer(),
      sendToSocket(data, SOCKET_NAME),
    ]);
    assertEquals([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], response);
  });

  await clearSocket(SOCKET_NAME);
});
