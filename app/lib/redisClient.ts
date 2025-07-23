// lib/redisClient.ts
import Redis from "ioredis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || 'https://cheerful-whale-55517.upstash.io' || 'redis://localhost:6379';

const redis = new Redis(redisUrl || "redis://127.0.0.1:6379");

export default redis;
