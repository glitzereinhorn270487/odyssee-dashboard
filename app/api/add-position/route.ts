// app/api/add-position/route.ts

import { NextResponse } from "next/server";
import { sendTelegramBuyMessage } from "@/lib/telegram";
import { v4 as uuidv4 } from "uuid";
import { Redis } from "@upstash/redis";
import { setRedisValue } from "@/lib/redis"

const redis = Redis .fromEnv ( )

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      tokenSymbol,
      tokenAddress,
      entryPrice,
      buyTime,
      strategy,
    } = body;

    const id = uuidv4();

    const trade = {
      id,
      tokenSymbol,
      tokenAddress,
      entryPrice,
      buyTime,
      strategy,
    };

   

    await setRedisValue('position:${token.address}', {
      symbol: tokenSymbol,
      address: tokenAddress,
      entryPrice,
    });
    // DUMMY-Werte für ScoreX, FomoScore und PumpRisk – später dynamisch machen
    const scoreX = 72;
    const fomoScore = "mittel";
    const pumpRisk = "niedrig";

    // Telegram-Kaufnachricht senden
    await sendTelegramBuyMessage({
      address: tokenAddress,
      symbol: tokenSymbol,
      scoreX,
      fomoScore,
      pumpRisk,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
    return NextResponse.json({ success: false, error: "Fehler beim Speichern" });
  }
}
