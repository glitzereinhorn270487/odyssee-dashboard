// app/api/redis-test-set/route.ts
import { NextResponse } from "next/server";
import { setRedisValue } from "@/lib/redis";

export async function GET() {
  const testKey = "wallet:test123";
  const testValue = {
    alphaScore: 88,
    winRate: 0.95,
    note: "Testwert aus Redis-Test-Route",
  };

  await setRedisValue(testKey, testValue);

  return NextResponse.json({ success: true, inserted: testValue });
}
