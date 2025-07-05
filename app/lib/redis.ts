// lib/redis.ts

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL!;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

export async function getRedisValue(key: string): Promise<any> {
  const res = await fetch(`${REDIS_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = await res.json();
  try {
    return JSON.parse(data.result);
  } catch {
    return data.result;
  }
}

export async function setRedisValue(key: string, value: any): Promise<void> {
  await fetch(`${REDIS_URL}/set/${key}/${encodeURIComponent(JSON.stringify(value))}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
}

export async function isTokenAlreadyTracked(key: string): Promise<boolean> {
  const val = await getRedisValue(key);
  return val !== null && val !== undefined;
}

export async function trackTokenInRedis(key: string, value: any): Promise<void> {
  await setRedisValue(key, value);
}
