import Redis from "ioredis";

const redis = new Redis(process.env.CUSTOM_REDIS_URL!, {
  tls: {},
  maxRetriesPerRequest: 5,
  enableOfflineQueue: false
});

// Funktion: Prüfen, ob Token bereits verarbeitet wurde
export async function isTokenAlreadyTracked(tokenAddress: string): Promise<boolean> {
  const result = await redis.get(`tracked:${tokenAddress}`);
  return !!result;
}

// Funktion: Token als verarbeitet markieren
export async function trackTokenInRedis(tokenAddress: string): Promise<void> {
  await redis.set(`tracked:${tokenAddress}`, "1", "EX", 60 * 60); // Gültig für 1 Stunde
}

export default redis;