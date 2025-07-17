import { getAllKeys, getRedisValue } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const keys = await getAllKeys();
    const entries: Record<string, any> = {};

    for (const key of keys) {
      entries[key] = await getRedisValue(key);
    }

    return NextResponse.json({ success: true, keys, entries });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Fehler" }, { status: 500 });
  }
}
