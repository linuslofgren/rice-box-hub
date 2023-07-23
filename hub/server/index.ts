import { Redis, RedisSubscription, connect } from "https://deno.land/x/redis@v0.29.3/mod.ts";
import { AppendingQueueController } from "./appendingQueueController.ts";
import { hubServer } from "./server.ts";
import { AckDataType, DisplacementJobResult, RFData, RFThroughType } from "./types.ts";

let publishRedis: Redis;
let redisSub: RedisSubscription;
const TIME_PADDING = 500 //milliseconds padding to allow a moment of swinging

try {
  publishRedis = await connect({
    hostname: "redis",
    port: 6379,
  });
  const conn = await connect({
    hostname: "redis",
    port: 6379,
  });
  redisSub = await conn.subscribe('ris_position_ack', 'RF_throughput')
} catch (error) {
  console.log(error);
}

console.log('[WebSocket Server] Subscribed to Redis')

const { iterator: toRedisIterator, add: addToRedis } = AppendingQueueController<DisplacementJobResult>();
const { iterator: broascastIterator, add: broadcast } = AppendingQueueController<AckDataType | RFThroughType>();

const format = new Intl.NumberFormat("en-US", {
  style: "decimal",
  maximumFractionDigits: 3,
}).format;

const redisSendLoop = async () => {
  for await (const { configuration, jobId } of toRedisIterator()) { 
    console.log("[WebSocket Server] Configuration from JULIA", configuration);
    const message = `<${configuration.map(format).join(",")}|${jobId||''}>`
    await publishRedis.publish("ris_position", message);
    console.log("[WebSocket Server] published", message);
  }
};

let recentAck: AckDataType | null
let latestMeasurement: RFData | null

const redisReceiveLoop = async () => {
  for await(const { channel, message } of redisSub.receive()) {
    if(channel === 'ris_position_ack') {
      handleAck(message)
    } else if(channel === 'RF_throughput') {
      const measurement: RFData = JSON.parse(message)
      latestMeasurement = measurement
      broadcast(() => Promise.resolve({ ...measurement, type: 'RF_throughput'}))
    }
    if(!latestMeasurement || !recentAck || !recentAck.timestamp) continue // TODO make sure acks have timestamps
    if(latestMeasurement.timestamp - TIME_PADDING < recentAck.timestamp) continue
    const ack: AckDataType = { ...recentAck, result: latestMeasurement.magnitude_dB }
    broadcast(() => Promise.resolve(ack))
    latestMeasurement = null
    recentAck = null
  }
}
const handleAck = (message: string) => {
  console.log('[WebSocket Server] From Ack channel:', message)
  message = message.substring(message.indexOf('<')+1, message.indexOf('>'))
  const [_config, jobId, timestamp] = message.split('|')
  const result: AckDataType = { 
    type: 'ris_position_ack', 
    jobId: jobId.length ? jobId : undefined, 
    timestamp: jobId.length ? parseInt(timestamp) : undefined 
  }
  
  // Supplying no ID means requesting no feedback
  if(jobId.length === 0) {
    console.log('Skipping measurement')
    broadcast(() => Promise.resolve(result)) 
  }
  else {
    recentAck = result
  } 
}

await Promise.race([hubServer(addToRedis, broascastIterator), redisSendLoop(), redisReceiveLoop()]);
