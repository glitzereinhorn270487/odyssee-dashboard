import { NextResponse } from "next/server";
import { fetchNewRaydiumPools } from "@/lib/helius-raydium";
import { isTokenAlreadyTracked, trackTokenInRedis } from "@/lib/redis";
import { decideTrade } from "@/agent/trade-engine";
import { sendTelegramBuyMessage } from "@/lib/telegram";

// Globale Rate-Limit-Sperre (serverless-safe)
declare global {
  var lastCallTime: number | undefined;
}

export async function GET() {
  try { // Start des try-Blocks
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

    const pools = await fetchNewRaydiumPools();
    if (!pools || pools.length === 0) {
      console.log("[AGENT-TICK] Keine neuen Pools gefunden.");
      return NextResponse.json({ success: true, message: "Keine neuen Pools." });
    }

    let processedTrades = 0;

    for (const pool of pools) { // Start der for-Schleife
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
      
      if (decision) {
        const tokenDataToTrack = {
          ...decision,
          address: tokenAddress,
          symbol: tokenSymbol,
          name: tokenName,
          boosts: decision.boosts || [],
          timestamp: Date.now(),
        };
        await trackTokenInRedis(`live:${tokenAddress}`, tokenDataToTrack);

        if (decision.shouldBuy) {
          processedTrades++;
          await sendTelegramBuyMessage({
            address: tokenAddress,
            symbol: tokenSymbol,
            scoreX: decision.scoreX,
            fomoScore: decision.fomoScore || "N/A",
            pumpRisk: decision.pumpRisk || "N/A",
          });
        }
      } else {
        console.log(`[AGENT-TICK] Keine Entscheidung für Token ${tokenSymbol}. Überspringe.`);
        // Optional: Token trotzdem tracken, um Doppelprüfung zu vermeiden
        await trackTokenInRedis(`live:${tokenAddress}`, { ignored: true, timestamp: Date.now() });
      }
    } // Ende der for-Schleife

    console.log(`[AGENT-TICK] Scan beendet. ${pools.length} neue Pools gefunden, ${processedTrades} Trades verarbeitet.`);

    return NextResponse.json({ success: true, message: `Scan erfolgreich. ${processedTrades} Trades verarbeitet.` });

  } catch (error: any) { // Start des catch-Blocks
    console.error("[AGENT-TICK-ERROR] Ein unerwarteter Fehler ist aufgetreten:", error);
    return NextResponse.json(
      { success: false, message: "Ein interner Fehler ist aufgetreten.", error: error.message },
      { status: 500 }
    );
  } // Ende des catch-Blocks
} // Ende der GET-Funktion