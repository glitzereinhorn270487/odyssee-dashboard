// app/api/view-redis/route.ts
import { NextResponse } from "next/server";
import { getAllKeys, getRedisValue } from "@/lib/redis";

export async function GET() {
  try {
    const keys = await getAllKeys();

    const entries = await Promise.all(
      keys.map(async (key) => {
        const value = await getRedisValue(key);
        return { key, value };
      })
    );

    return NextResponse.json({ success: true, entries }, { status: 200 });
  } catch (error: any) {
    console.error("[ADMIN-REDIS-VIEW ERROR]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Unbekannter Fehler" },
      { status: 500 }
    );
  }
}
