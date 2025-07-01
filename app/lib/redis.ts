import Redis from "ioredis";

const redis = new Redis(process.env.CUSTOM_REDIS_URL!, {
  tls: {}, // oder { rejectUnauthorized: false } falls nötig
  maxRetriesPerRequest: 5,
  enableOfflineQueue: false
});

export default redis;