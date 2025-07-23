import { getRedisValue } from "@/lib/redis";

export async function GET() {
  const keysResponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/keys`, {
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
    },
  });

  const data = await keysResponse.json();
  const keys: string[] = data.result ?? [];

  const filtered = keys.filter((key: string) =>
    key.startsWith("wallets:redflag:")
  );

  const entries = await Promise.all(
    filtered.map(async (key: string) => {
      const value = await getRedisValue(key);
      return { key, value };
    })
  );

  console.log("entries:", entries);

  return new Response(
    JSON.stringify({ success: true, count: entries.length, entries }, null, 2),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
