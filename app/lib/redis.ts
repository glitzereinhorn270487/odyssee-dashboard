import Redis from "ioredis";

const redis = new Redis(process.env.CUSTOM_REDIS_URL!, {
  tls: {}, // Upstash benötigt TLS (bei rediss:// URLs)
  connectTimeout: 10000, // 10 Sekunden Timeout
  maxRetriesPerRequest: 2,
  enableOfflineQueue: true, // ⬅️ Jetzt Pufferung aktivieren!
  retryStrategy(times) {
    if (times >= 3) return null;
    return Math.min(times * 1000, 3000); // retry alle Sekunde bis max 3x
  },
});

export default redis;
