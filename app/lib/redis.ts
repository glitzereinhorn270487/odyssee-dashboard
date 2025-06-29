// app/lib/redis.ts
import Redis from "ioredis";

// Prüfe, ob REDIS_URL gesetzt ist
if (!process.env.REDIS_URL) {
  throw new Error("❌ REDIS_URL is not defined in environment variables");
}

// Redis-Instanz mit TLS-Verbindung (für Redis Cloud)
const redis = new Redis(process.env.REDIS_URL, {
  tls: {},
});

export default redis;