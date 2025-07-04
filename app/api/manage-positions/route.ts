// app/api/manage-positions/route.ts
import { NextResponse } from "next/server";
import { redis, isTokenAlreadyTracked, trackTokenInRedis } from "@/lib/redis";
import { getLivePrice, checkSellRules } from "@/lib/price-manager";
import { sendTelegramMessage } from "@/lib/telegram";

// Beispiel-Handler (du kannst deine eigene Logik hier weiter einsetzen)
export async function GET() {
  const testKey = "debug:test";
  await redis.set(testKey, "It works!");
  const value = await redis.get(testKey);

  return NextResponse.json({ success: true, value });
}
