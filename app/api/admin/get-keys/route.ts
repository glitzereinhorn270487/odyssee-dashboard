// API-Route: Holt alle Keys und zugehörige Inhalte
import { NextResponse } from "next/server";
import { getAllKeys, getRedisValue } from "@/lib/redis";

export async function GET() {
  try {
    const keys = await getAllKeys();
    const filtered = keys.filter((key: string) => key.startsWith("wallets:redflag"));

   const entries = await Promise.all(
     filtered.map(async (key) => {
       const value: await getRedisValue(key);
       return { key, value };
      })
    );

    return NextResponse.json({ success: true, data: entries });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || "Unbekannter Fehler",
    }, { status: 500 });
  }
}
