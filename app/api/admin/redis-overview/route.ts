import { getAllKeys, getRedisValue } from "@/lib/redis";

export async function GET() {
  try {
    const rawKeys = await getAllKeys();
    const filtered = rawKeys.filter((key) =>
      key.startsWith("wallets:redflag:") || key.startsWith("redflag:")
    );

    const entries = await Promise.all(
      filtered.map(async (key) => {
        const value = await getRedisValue(key);
        return { key, value };
      })
    );

    return Response.json({ success: true, count: entries.length, entries });
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    });
  }
}
