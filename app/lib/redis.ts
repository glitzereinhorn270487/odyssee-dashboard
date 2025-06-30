// lib/redis.ts
import Redis from "ioredis";

const redis = new Redis(process.env.CUSTOM_REDIS_URL!, {
  tls: {
    rejectUnauthorized: false,
  },
  maxRetriesPerRequest: 2,
  enableOfflineQueue: false,
});

export default redis;