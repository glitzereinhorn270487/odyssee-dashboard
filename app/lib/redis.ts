const redisUrl = process.env.UPSTASH_REDIS_REST_URL!;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN!;

export async function getRedisValue(key: string): Promise<any | null> {
  const res = await fetch(`${redisUrl}/get/${key}`, {
    headers: {
      Authorization: `Bearer ${redisToken}`,
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result ? JSON.parse(data.result) : null;
}

export async function setRedisValue(key: string, value: any): Promise<void> {
  await fetch(`${redisUrl}/set/${key}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([value]),
  });
}
