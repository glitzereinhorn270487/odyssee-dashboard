// app/api/manage-positions/route.ts

import { NextResponse } from "next/server";
import { getRedisValue, setRedisValue } from "@/lib/redis";

export async function POST(req: Request) {
  const body = await req.json();
  const { tokenAddress, tradeData } = body;

  if (!tokenAddress || !tradeData) {
    return new NextResponse("❌ Ungültige Daten", { status: 400 });
  }

  const alreadyTracked = await getRedisValue(`live:${tokenAddress}`);
  if (alreadyTracked) {
    return new NextResponse("[ALREADY_TRACKED]", { status: 200 });
  }

  await setRedisValue(`live:${tokenAddress}`, tradeData);

  return new NextResponse("✅ Token erfolgreich gespeichert", { status: 200 });
}
