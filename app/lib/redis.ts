// app/lib/redis.ts
const baseUrl = process.env.UPSTASH_REDIS_REST_URL!;
const token = process.env.UPSTASH_REDIS_REST_TOKEN!;

export async function getRedisValue(key: string): Promise<any | null> {
  const res = await fetch(`${baseUrl}/get/${key}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.result ?? null;
}

export async function setRedisValue(key: string, value: any): Promise<boolean> {
  const res = await fetch(`${baseUrl}/set/${key}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([value]),
  });

  return res.ok;
}
