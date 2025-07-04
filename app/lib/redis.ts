// app/lib/redis.ts
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function isTokenAlreadyTracked(token: string): Promise<boolean> {
  const result = await redis.get(`live:${token}`);
  return !!result;
}

export async function trackTokenInRedis(token: string, data: any): Promise<void> {
  await redis.set(`live:${token}`, data); // Bei Upstash kein JSON.stringify nötig
}
