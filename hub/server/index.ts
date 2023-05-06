import { connect } from "https://deno.land/x/redis@v0.29.3/mod.ts";
import { hubServer } from "./server.ts";
import { AppendingQueueController } from "./appendingQueueController.ts";
import { Configuration } from "./types.ts";

const redis = await connect({
  hostname: "127.0.0.1",
  port: 6379,
});

const { iterator, add } = AppendingQueueController<Configuration>();

const placementLoop = async () => {
  for await (const risConfiguration of iterator()) {
    // TODO: Send configuration to RIS via serial
    console.log("Configuration from JULIA", risConfiguration);
    await redis.publish("ris_position", risConfiguration.join(","))
  }
};

await Promise.race([placementLoop(), hubServer(add)]);
