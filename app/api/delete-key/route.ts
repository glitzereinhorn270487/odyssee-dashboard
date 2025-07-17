import { delRedisKey } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) return NextResponse.json({ error: "Key fehlt" }, { status: 400 });

  await delRedisKey(key);
  return NextResponse.json({ success: true, deletedKey: key });
}
