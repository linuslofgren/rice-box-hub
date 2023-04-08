import { assertEquals } from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { AppendingQueueController } from "./appendingQueueController.ts";

Deno.test("AppendingQueueController", async (t) => {
  const { iterator, add, shutdown } = AppendingQueueController<symbol>();

  const retVal = Symbol();

  add(() =>
    new Promise((res, _) => {
      res(retVal);
    })
  );

  const it = iterator();

  assertEquals(retVal, (await it.next()).value);

  const retVal2 = Symbol();
  add(() =>
    new Promise((res, _) => {
      res(retVal2);
    })
  );

  const retVal3 = Symbol();
  add(() =>
    new Promise((res, _) => {
      res(retVal3);
    })
  );

  assertEquals(retVal3, (await it.next()).value);

  shutdown();
});
