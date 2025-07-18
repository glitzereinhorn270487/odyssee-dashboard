import { getAllKeys, getRedisValue } from "@/lib/redis";

export async function GET() {
  try {
    const rawKeys = await getAllKeys();

    const filteredKeys = rawKeys.filter((key) =>
      key.startsWith("wallets:redflag:") || key.startsWith("redflag:")
    );

    const entries = await Promise.all(
      filteredKeys.map(async (key) => {
        const value = await getRedisValue(key);
        return { key, value };
      })
    );

    return new Response(
  JSON.stringify(
    { success: true, count: entries.length, entries },
    null,
    2
  ),
  {
    status: 200,
    headers: { "Content-Type": "application/json" },
  }
);
} catch (error: any) {
  return new Response(
    JSON.stringify({ success: false, error: error.message}),
    { status: 500, headers: { "Content-Type": "application/json" } }
  );
}
}