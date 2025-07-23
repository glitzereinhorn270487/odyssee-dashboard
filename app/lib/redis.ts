import Redis from '@upstash/redis';

const redis = Redis .fromEnv ( );

let client: Redis | null = null;

export async function getRedisClient(): Promise<Redis> {
  if (!client) {
    client =  Redis .fromEnv ( )
  }
  return client;
}

export async function getMonitoredWallets(): Promise<string[]> {
  const keys = await getAllKeys();
  return keys.filter((k)=> k.startsWith("wallet:")).map((k) => k.split(":")[1]);
}

export async function delRedisKey(key: string) {
  const client = await getRedisClient();
  await client.del(key);
}

export async function getMonitoredExport() {
  const keys = await redis?.keys("monitored:*");
  const results = await Promise.all(keys.map(async () => {
    const value = await redis.get(keys);
    return { keys, value };
  }));
  return results;
}

export async function getRedisValue<T>(key: string): Promise<T |null> {
  const value = await redis.get(key);
  if (!value) return null;
  return JSON.parse(value);
}

export async function getAllKeys(): Promise<string[]> {
  return redis.keys("*");
}

export async function setRedisValue<T>(key: string, value: T): Promise<void> {
  await redis.set(key, JSON.stringify(value));
}

// Prüft, ob ein Token bereits getrackt wurde (z. B. durch ID)
export async function isTokenAlreadyTracked(tokenId: string): Promise<boolean> {
  const exists = await redis.exists(`tracked:${tokenId}`)
  return exists === 1
}

// Markiert ein Token als getrackt (dauerhaft)
export async function trackTokenInRedis(key: string, data: any) {
  const redisKey = 'tracked:${key}';
  await setRedisValue(redisKey, data);
}

export const investLevelArray = ["M0", "M1", "M2", "M3", "M4", "M5"];
  

// Alternative mit Ablaufzeit (z. B. 6h = 21600 Sekunden)
export async function trackTokenWithTTL(tokenId: string, ttlSeconds = 21600): Promise<void> {
  await redis.set(`tracked:${tokenId}`, '1', 'EX', ttlSeconds)
}
export async function saveTokenScores(tokenAddress: string, fomoScore: string, pumpRisk: string) {
  await redis.hset(`token:${tokenAddress}`, {
    fomoScore,
    pumpRisk,
  });
}

export async function getTokenScores(tokenAddress: string): Promise<{ fomoScore: string, pumpRisk: string }> {
  const result = await redis.hgetall(`token:${tokenAddress}`)
  return {
    fomoScore: result.fomoScore || 'Nicht vorhanden',
    pumpRisk: result.pumpRisk || 'Nicht vorhanden',
  };
}

