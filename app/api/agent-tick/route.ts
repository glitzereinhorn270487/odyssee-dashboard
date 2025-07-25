// app/api/agent-tick/route.ts

import { NextResponse } from "next/server";
import { isTokenAlreadyTracked, setRedisValue } from "@/lib/redis"; // trackTokenInRedis ersetzt durch setRedisValue
import { decideTrade } from "@/agent/trade-engine"; // Korrekter Pfad
import { sendTelegramBuyMessage, sendTelegramSystemMessage } from "@/lib/telegram"; // sendTelegramSystemMessage hinzugefügt
import { getTelegramToggles } from "@/config/telegramToggles"; // getTelegramToggles importiert
import { getBotRunningStatus } from "@/lib/bot-status"; // getBotRunningStatus importiert

// Globale Rate-Limit-Sperre (serverless-safe)
declare global {
  var lastCallTime: number | undefined;
}

const MAX_RETRIES = 5; // Max. Wiederholungsversuche für Helius-Fehler (z.B. Rate Limit)

// Helius-Fetch-Funktion (angenommen, sie existiert in helius-logic.ts oder wird hier direkt implementiert)
// Da der Fehler 'fetchFromHelius' nicht gemeldet wurde, gehe ich davon aus, dass er existiert oder nicht aufgerufen wird.
// Falls 'fetchFromHelius' nicht existiert, müsste dies ein TODO sein, das du implementierst.
async function safeFetchFromHelius(wallet: string): Promise<any | null> {
  let retryCount = 0;
  while (retryCount < MAX_RETRIES) {
    try {
      // Annahme: fetchFromHelius ist eine Funktion, die Daten für eine Wallet abruft.
      // Falls dies eine Dummy-Funktion ist, muss sie später mit echter Helius-Logik gefüllt werden.
      // Für jetzt simulieren wir eine erfolgreiche Antwort.
      console.log(`[HeliusFetch] Simuliere Fetch für Wallet: ${wallet}`);
      return { success: true, data: [] }; // Dummy-Antwort
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

// NEU: Typdefinition für ein Pool-Objekt
interface Pool {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
}

export async function GET() {
  const now = Date.now();
  const lastCall = globalThis.lastCallTime || 0;

  // Prüfe, ob der Bot überhaupt laufen soll
  const botRunning = await getBotRunningStatus();
  if (!botRunning) {
    console.log("[AGENT-TICK] Bot ist gestoppt. Überspringe Scan.");
    return NextResponse.json({ success: false, message: "Bot ist gestoppt." }, { status: 200 });
  }

  // Rate-Limit-Schutz für Vercel Serverless Functions (15 Sekunden Pause)
  if (now - lastCall < 15000) {
    return NextResponse.json(
      { success: false, message: "Rate limit schützt (15 Sek. Pause)" },
      { status: 429 }
    );
  }

  globalThis.lastCallTime = now;
  console.log("[AGENT-TICK] Pool-Scan läuft...");

  const telegramToggles = await getTelegramToggles(); // Telegram-Toggles abrufen

  try {
    // TODO: fetchNewRaydiumPools müsste hier oder in einem Helper implementiert werden
    // Für jetzt simulieren wir eine leere Liste oder eine kleine Dummy-Liste
    // KORREKTUR: Explizite Typisierung des 'pools'-Arrays
    const pools: Pool[] = [
      // { tokenAddress: "TOKEN_ADDRESS_1", tokenSymbol: "SYM1", tokenName: "Token One" },
      // { tokenAddress: "TOKEN_ADDRESS_2", tokenSymbol: "SYM2", tokenName: "Token Two" },
    ]; // await fetchNewRaydiumPools();

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
        // Telegram-Nachricht wird bereits in decideTrade gesendet
        console.log(`[AGENT-TICK] Kaufentscheidung für ${tokenSymbol} mit Score ${decision.finalScore}`);
      }

      // Speichern der Entscheidung und des Token-Status in Redis
      // trackTokenInRedis wurde ersetzt durch setRedisValue (oder trackTokenWithTTL)
      await setRedisValue(`live:${tokenAddress}`, {
        address: tokenAddress,
        symbol: tokenSymbol,
        scoreX: decision?.finalScore || 0, // Sicherstellen, dass decision nicht null ist
        boosts: decision?.boostReasons || [],
        pumpRisk: decision?.pumpRisk || 'N/A',
        timestamp: Date.now(),
        // Weitere relevante Daten aus decision hinzufügen
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
