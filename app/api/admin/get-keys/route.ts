// API-Route: Holt alle Keys und zugehörige Inhalte
import { NextResponse } from "next/server";
import { getAllKeys, getRedisValue } from "@/lib/redis";

export async function GET() {
  try {
    const keys = await getAllKeys();

    const data = await Promise.all(
      keys.map(async (key) => ({
        key,
        value: await getRedisValue(key),
      }))
    );

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || "Unbekannter Fehler",
    }, { status: 500 });
  }
}
