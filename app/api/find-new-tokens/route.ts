// app/api/find-new-tokens/route.ts
import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { fetchNewPools, analyseToken } from "@/lib/helius-logic";
import { isInsider, isSmartMoney, isRedFlag, isViralX, isNarrativeMaker } from "@/lib/classifier";
import { sendTelegramMessage } from "@/lib/telegram";

export async function GET(req: Request) {
  try {
    const newPools = await fetchNewPools(); // prüft letzte Minute
    if (!newPools.length) {
      return NextResponse.json({ status: "No new pools found" });
    }

    for (const pool of newPools) {
      const tokenData = await analyseToken(pool); // Sicherheitsprüfung, Scoring, etc.

      if (isInsider(tokenData.wallet)) {
        await redis.set(`insider:${tokenData.token}`, JSON.stringify(tokenData));
        await sendTelegramMessage(`🚨 Neuer Insider-Token: ${tokenData.token}`);
      }

      if (isSmartMoney(tokenData.wallet)) {
        await redis.set(`smartmoney:${tokenData.token}`, JSON.stringify(tokenData));
      }

      if (isViralX(tokenData.source)) {
        await redis.set(`viralx:${tokenData.token}`, JSON.stringify(tokenData));
      }

      if (isNarrativeMaker(tokenData.source)) {
        await redis.set(`narrative:${tokenData.token}`, JSON.stringify(tokenData));
      }

      if (isRedFlag(tokenData.wallet)) {
        await redis.set(`redflag:${tokenData.token}`, JSON.stringify(tokenData));
        await sendTelegramMessage(`⚠️ RED FLAG Token entdeckt: ${tokenData.token}`);
      }
    }

    return NextResponse.json({ status: "Tokens verarbeitet", count: newPools.length });
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Token-Scan", detail: error }, { status: 500 });
  }
}

