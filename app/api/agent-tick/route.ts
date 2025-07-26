// app/api/agent-tick/route.ts

import { NextResponse } from "next/server";
import { isTokenAlreadyTracked, setRedisValue } from "@/lib/redis"; 
// KORREKTUR: Verwende den relativen Pfad, der immer funktioniert.
import { decideTrade } from "../../agent/trade-engine"; 
import { sendTelegramBuyMessage, sendTelegramSystemMessage } from "@/lib/telegram"; 
import { getTelegramToggles } from "@/config/telegramToggles"; 
import { getBotRunningStatus } from "@/lib/bot-status"; 

declare global {
  var lastCallTime: number | undefined;
}

const MAX_RETRIES = 5; 

async function safeFetchFromHelius(wallet: string): Promise<any | null> {
  let retryCount = 0;
  while (retryCount < MAX_RETRIES) {
    try {
      console.log(`[HeliusFetch] Simuliere Fetch für Wallet: ${wallet}`);
      return { success: true, data: [] }; 
    } catch (e: any) {
      if (e.message?.includes("429")) {
        retryCount++;
        const delay = 2 ** retryCount * 1000;
        console.warn(`[RateLimit] Retry ${retryCount}/${MAX_RETRIES} in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw e;
      }
    }
  }
  console.warn("[RateLimit] Max. Re-tries erreicht, breche Light-Modus ab.");
  return null;
}

interface Pool {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
}

export async function GET() {
  const now = Date.now();
  const lastCall = globalThis.lastCallTime || 0;

  const botRunning = await getBotRunningStatus();
  console.log(`[AGENT-TICK] Beim Start: Bot Running Status: ${botRunning ? 'ONLINE' : 'OFFLINE'}`); 

  if (!botRunning) {
    console.log("[AGENT-TICK] Bot ist gestoppt. Überspringe Scan.");
    return NextResponse.json({ success: false, message: "Bot ist gestoppt." }, { status: 200 });
  }

  if (now - lastCall < 15000) {
    return NextResponse.json(
      { success: false, message: "Rate limit schützt (15 Sek. Pause)" },
      { status: 429 }
    );
  }

  globalThis.lastCallTime = now;
  console.log("[AGENT-TICK] Pool-Scan läuft...");

  const telegramToggles = await getTelegramToggles(); 

  try {
    const pools: Pool[] = []; 

    let processedTrades = 0;

    for (const pool of pools) {
      const { tokenAddress, tokenSymbol, tokenName } = pool;

      const alreadyTracked = await isTokenAlreadyTracked(tokenAddress);
      if (alreadyTracked) {
        console.log(`[AGENT-TICK] Token ${tokenSymbol} (${tokenAddress}) bereits getrackt. Überspringe.`);
        continue;
      }

      console.log(`[AGENT-TICK] Neuer Pool entdeckt: ${tokenSymbol} (${tokenAddress}). Starte Bewertung...`);

      const decision = await decideTrade({ address: tokenAddress, symbol: tokenSymbol, name: tokenName });

      if (decision?.shouldBuy) {
        processedTrades++;
        console.log(`[AGENT-TICK] Kaufentscheidung für ${tokenSymbol} mit Score ${decision.finalScore}`);
      }

      await setRedisValue(`live:${tokenAddress}`, {
        address: tokenAddress,
        symbol: tokenSymbol,
        scoreX: decision?.finalScore || 0, 
        boosts: decision?.boostReasons || [],
        pumpRisk: decision?.pumpRisk || 'N/A',
        timestamp: Date.now(),
      });
      console.log(`[AGENT-TICK] Token ${tokenSymbol} in Redis getrackt.`);
    }

    console.log(`[AGENT-TICK] Scan beendet. ${pools.length} neue Pools gefunden, ${processedTrades} Trades verarbeitet.`);
    return NextResponse.json({ success: true, message: `Scan erfolgreich. ${processedTrades} Trades verarbeitet.` });

  } catch (error: any) {
    console.error("[AGENT-TICK-ERROR] Ein unerwarteter Fehler ist aufgetreten:", error);
    if (telegramToggles.global && telegramToggles.errors) {
      await sendTelegramSystemMessage({
        symbol: `Agent-Tick Fehler`,
        message: `Kritischer Fehler im Agent-Tick Cronjob: ${error.message || error}`,
        isError: true,
      });
    }
    return NextResponse.json(
      { success: false, message: "Ein interner Fehler ist aufgetreten.", error: error.message },
      { status: 500 }
    );
  }
}
