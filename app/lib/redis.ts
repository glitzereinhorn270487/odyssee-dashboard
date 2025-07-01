// lib/redis.ts
import Redis from "ioredis";
if (!redis.status || redis.status !== "ready") {
  console.log("Redis ist nicht bereit.");
  return new Response("Redis nicht verbunden", { status: 503 });
}
const redis = new Redis(process.env.CUSTOM_REDIS_URL!, {

  tls: {
    rejectUnauthorized: false,
  },
  maxRetriesPerRequest: 2,
  enableOfflineQueue: false,
});

export default redis;