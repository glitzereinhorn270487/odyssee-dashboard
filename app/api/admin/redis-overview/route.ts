import { getAllKeys, getRedisValue } from "@/lib/redis";

export async function GET() {
  const rawKeys = await getAllKeys();
  const filtered = rawKeys.filter((key) =>
    key.startsWith("wallets:redflag:") || key.startsWith("redflag:"),
 rawKeys.map(async (key) => {
   
      const value = await getRedisValue(key);
      return { key, value };
    })
  );

  return Response.json({ success: true, entries });
}
