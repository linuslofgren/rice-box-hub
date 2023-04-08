import { hubServer } from "./server.ts";
import { AppendingQueueController } from "./appendingQueueController.ts";
import { Configuration } from "./types.ts";

const { iterator, add } = AppendingQueueController<Configuration>();

const placementLoop = async () => {
  for await (const risConfiguration of iterator()) {
    // TODO: Send configuration to RIS via serial
    console.log(risConfiguration);
  }
};

await Promise.race([placementLoop(), hubServer(add)]);
