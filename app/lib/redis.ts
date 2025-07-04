// app/lib/redis.ts
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL!;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

export async function getRedisValue(key: string): Promise<string | null> {
  const res = await fetch(`${UPSTASH_URL}/get/${key}`, {
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
    },
  });

  const data = await res.json();
  return data.result ?? null;
}

export async function setRedisValue(key: string, value: any): Promise<void> {
  await fetch(`${UPSTASH_URL}/set/${key}/${encodeURIComponent(JSON.stringify(value))}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
    },
  });
}
