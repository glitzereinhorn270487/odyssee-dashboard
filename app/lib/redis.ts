// lib/redis.ts
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL! {
  maxRetriesPerRequest: 5,
  enableOfflineQueue: false,
});

export async function isTokenAlreadyTracked(token: string): Promise<boolean> {
  const result = await redis.get(`live:${token}`);
  return !!result;
}

export async function trackTokenInRedis(token: string, data: any): Promise<void> {
  await redis.set(`live:${token}`, JSON.stringify(data));
}

export default redis;
