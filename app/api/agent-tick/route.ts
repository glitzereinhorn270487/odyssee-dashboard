import { NextResponse } from "next/server";
import { fetchNewRaydiumPools } from "@/lib/helius-raydium";
import { isTokenAlreadyTracked, trackTokenInRedis } from "@/lib/redis";
import { decideTrade } from "@/agent/trade-engine";
import { sendTelegramMessage } from "@/lib/telegram";

// Globale Variable zum Schutz vor zu häufiger Ausführung (serverless-safe)
declare global {
  var lastCallTime: number | undefined;
}

export async function GET() {
  try {
    const now = Date.now();
    const lastCall = globalThis.lastCallTime || 0;

    if (now - lastCall < 15000) {
      return NextResponse.json(
        { success: false, message: "Rate limit schützt (15 Sek. Pause)" },
        { status: 429 }
      );
    }

    globalThis.lastCallTime = now;

    console.log("[AGENT-TICK] Pool-Scan läuft...");

    const pools = await retryWithBackoff(() => fetchNewRaydiumPools(), 3);

    if (!pools || pools.length === 0) {
      return NextResponse.json({ success: true, message: "Keine neuen Pools" });
    }

    let newTrades = 0;

    for (const pool of pools) {
      const { tokenAddress, tokenSymbol, tokenName } = pool;

      const alreadyTracked = await isTokenAlreadyTracked(`live:${tokenAddress}`);
      if (alreadyTracked) continue;

      const decision = await decideTrade(
        {
          address: tokenAddress,
          symbol: tokenSymbol,
          name: tokenName,
          category: "moonshot",
        },
        "M1"
      );

      if (decision?.shouldBuy) {
        await sendTelegramMessage(`📈 Paper-Trade für $${tokenSymbol} ausgelöst`);
        await trackTokenInRedis(`live:${tokenAddress}`, decision);
        newTrades++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${newTrades} neue Trades ausgelöst`,
    });
  } catch (error: any) {
    console.error("[AGENT-TICK ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unbekannter Fehler",
      },
      { status: 500 }
    );
  }
}

// 🔁 Retry-Funktion bei 429-Fehlern
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0 && err.message?.includes("429")) {
      console.warn(`[Retry] Rate limit, versuche erneut in ${delay}ms...`);
      await new Promise((res) => setTimeout(res, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}
