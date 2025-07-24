import redis from './redisClient'; // Importiert den fertigen Client

// --- Generische Redis-Helfer ---

export async function getAllKeys(): Promise<string[]> {
  return redis.keys("*");
}

export async function getRedisValue<T>(key: string): Promise<T | null> {
  const value = await redis.get(key) as string | null;
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Fehler beim Parsen von JSON für Key ${key}:`, error);
    return null;
  }
}

export async function setRedisValue<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  const stringValue = JSON.stringify(value);
  if (ttlSeconds) {
    await redis.set(key, stringValue, { ex: ttlSeconds });
  } else {
    await redis.set(key, stringValue);
  }
}

export async function delRedisKey(key: string): Promise<void> {
  await redis.del(key);
}

// --- Wallet-spezifische Funktionen ---

export async function getMonitoredWallets(): Promise<string[]> {
  const keys = await redis.keys("wallet:*");
  return keys.map((key: string) => key.split(":")[1]);
}

// --- Token-spezifische Funktionen ---

export async function isTokenAlreadyTracked(tokenId: string): Promise<boolean> {
  const exists = await redis.exists(`tracked:${tokenId}`);
  return exists === 1;
}

export async function trackTokenInRedis(key: string, data: any): Promise<void> {
  const redisKey = `tracked:${key}`; // KORREKTUR: Backticks anstatt Single-Quotes
  await setRedisValue(redisKey, data);
}

export async function trackTokenWithTTL(tokenId: string, ttlSeconds = 21600): Promise<void> {
  await redis.set(`tracked:${tokenId}`, '1', { ex: ttlSeconds });
}

export async function saveTokenScores(tokenAddress: string, scores: { fomoScore: string | number, pumpRisk: string }): Promise<void> {
  await redis.hset(`token:${tokenAddress}`, scores);
}

export async function getTokenScores(tokenAddress: string): Promise<{ fomoScore: string | number; pumpRisk: string } | null> {
  const result = await redis.hgetall(`token:${tokenAddress}`);

  if (!result || Object.keys(result).length === 0) {
    return null;
  }
  
  return {
    fomoScore: result.fomoScore = 'Nicht vorhanden',
    pumpRisk: result.pumpRisk = 'Nicht vorhanden',
  };
}

// --- Trade & Export Funktionen ---

export async function getMonitoredExport() {
  const keys = await redis.keys("monitored:*");
  const results = await Promise.all(
    keys.map(async (key: string) => {
      const value = await getRedisValue<any>(key); // Nutzt die Helfer-Funktion
      return { key, value };
    })
  );
  return results;
}

export function filterTradesByDate(trades: any[], start: string, end: string) {

}