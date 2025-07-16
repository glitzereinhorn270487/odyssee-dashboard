import { NextResponse } from "next/server";
import { fetchNewRaydiumPools } from "@/lib/helius-raydium";
import { isTokenAlreadyTracked, trackTokenInRedis } from "@/lib/redis";
import { decideTrade } from "@/agent/trade-engine";
import { sendTelegramMessage } from "@/lib/telegram";

// Globale Variable zum Schutz vor zu häufiger Ausführung (serverless-safe)
declare global {
  var lastCallTime: number | undefined;
}
// Import optional
let retryCount = 0;
const MAX_RETRIES = 5;

async function safeFetchFromHelius(wallet: string) {
  try {
    const res = await fetchFromHelius(wallet);
    retryCount = 0; // Reset bei Erfolg
    return res;
  } catch (e: any) {
    if (e.message?.includes("429")) {
      retryCount++;
      console.warn(`[RateLimit] 429 bei ${wallet}, Retry ${retryCount}/${MAX_RETRIES}`);
      if (retryCount >= MAX_RETRIES) {
        console.warn("[RateLimit] Max. Re-tries erreicht, breche Light-Modus Tick ab.");
        return null; // Brich ab nach X Versuchen
      }

      const delay = 2 ** retryCount * 1000; // 2s, 4s, 8s usw.
      await new Promise((r) => setTimeout(r, delay));
      return await safeFetchFromHelius(wallet); // Retry erneut
    }

    throw e; // Andere Fehler weiterwerfen
  }
}
// Beispiel: Nur 1 Wallet oder Token im Light-Modus
const monitored = await getMonitoredWallets();
const selected = monitored.slice(0, 1); // Nur 1 Wallet prüfen

// Statt fetchFromHelius(wallet.address)
const result = await safeFetchFromHelius(wallet.address);
if (!result) return; // Bei RateLimit-Abbruch beenden

const today = new Date();
const isLightMode = today < new Date("2025-07-24");

const selected = isLightMode ? monitored.slice(0, 1) : monitored;

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
