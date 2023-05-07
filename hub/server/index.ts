import { Redis, connect } from "https://deno.land/x/redis@v0.29.3/mod.ts";
import { hubServer } from "./server.ts";
import { AppendingQueueController } from "./appendingQueueController.ts";
import { Configuration } from "./types.ts";


let redis: Redis;
try {
  redis = await connect({
    hostname: "redis",
    port: 6379,
  });
   
} catch (error) {
  console.log(error);
  
}
const { iterator, add } = AppendingQueueController<Configuration>();

const format = new Intl.NumberFormat("en-US", {
  style: "decimal",
  maximumFractionDigits: 2,
}).format;

const placementLoop = async () => {
  for await (const risConfiguration of iterator()) {
    // TODO: Send configuration to RIS via serial
    console.log("Configuration from JULIA", risConfiguration);
    await redis.publish("ris_position", risConfiguration.configuration.map(format).join(","));
    console.log("published", risConfiguration.configuration.join(","));
    
  }
};

await Promise.race([placementLoop(), hubServer(add)]);
