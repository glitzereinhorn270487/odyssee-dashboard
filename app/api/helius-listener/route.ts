// app/api/helius-listener/route.ts
// Dieser Endpunkt empfängt Webhook-Events von Helius (z.B. neue Raydium Pools)

import { NextResponse } from 'next/server';
import { decideTrade } from '@/agent/trade-engine'; // Pfad korrigiert
import { setRedisValue, isTokenAlreadyTracked } from '@/lib/redis'; // trackTokenInRedis ersetzt
import { sendTelegramSystemMessage } from '@/lib/telegram'; // sendTelegramSystemMessage hinzugefügt
import { getTelegramToggles } from '@/config/telegramToggles'; // getTelegramToggles importiert
import { getBotRunningStatus } from '@/lib/bot-status'; // getBotRunningStatus importiert
import { ensureBotStatusInitialized } from '@/lib/bot-status';

await ensureBotStatusInitialized();

export async function POST(req: Request) {
  // Prüfe, ob der Bot überhaupt laufen soll
  const botRunning = await getBotRunningStatus();
  if (!botRunning) {
    console.log("[HELIUS-LISTENER] Bot ist gestoppt. Ignoriere Event.");
    return NextResponse.json({ success: false, message: "Bot ist gestoppt." }, { status: 200 });
  }

  const telegramToggles = await getTelegramToggles(); // Telegram-Toggles abrufen

  try {
    const event = await req.json();
    console.log("[HELIUS-LISTENER] Webhook Event empfangen:", JSON.stringify(event, null, 2));

    // Beispiel: Verarbeitung eines Raydium Pool Creation Events
    // Die genaue Struktur hängt vom Helius Webhook Typ ab.
    // Dies ist ein PLatzhalter, den du an deine tatsächlichen Events anpassen musst.
    const newPools = event.events?.someEventProperty?.newPools || []; // Beispielpfad

    if (newPools.length === 0) {
      console.log("[HELIUS-LISTENER] Kein neuer Pool im Event gefunden oder Event-Struktur unbekannt.");
      return NextResponse.json({ success: true, message: "Keine relevanten Pools verarbeitet." });
    }

    let processedPools = 0;

    for (const pool of newPools) {
      const tokenAddress = pool.mintAddress || pool.tokenAddress; // Beispiel: Je nachdem, wie Helius die Adresse liefert
      const tokenSymbol = pool.symbol || pool.tokenSymbol;
      const tokenName = pool.name || pool.tokenName;

      if (!tokenAddress || !tokenSymbol) {
        console.warn("[HELIUS-LISTENER] Ungültige Pool-Daten im Event:", pool);
        continue;
      }

      const alreadyTracked = await isTokenAlreadyTracked(tokenAddress);
      if (alreadyTracked) {
        console.log(`[HELIUS-LISTENER] Token ${tokenSymbol} (${tokenAddress}) bereits getrackt. Überspringe.`);
        continue;
      }

      console.log(`[HELIUS-LISTENER] Neuer Pool von Helius Webhook: ${tokenSymbol} (${tokenAddress}). Starte Bewertung...`);

      const decision = await decideTrade({ address: tokenAddress, symbol: tokenSymbol, name: tokenName });

      if (decision?.shouldBuy) {
        processedPools++;
        // Telegram-Nachricht wird bereits in decideTrade gesendet
        console.log(`[HELIUS-LISTENER] Kaufentscheidung für ${tokenSymbol} mit Score ${decision.finalScore}`);
      }

      // Speichern der Entscheidung und des Token-Status in Redis
      await setRedisValue(`live:${tokenAddress}`, {
        address: tokenAddress,
        symbol: tokenSymbol,
        scoreX: decision?.finalScore || 0,
        boosts: decision?.boostReasons || [],
        pumpRisk: decision?.pumpRisk || 'N/A',
        timestamp: Date.now(),
      });
      console.log(`[HELIUS-LISTENER] Token ${tokenSymbol} in Redis getrackt.`);
    }

    return NextResponse.json({ success: true, message: `Verarbeitet ${processedPools} neue Pools.` });

  } catch (error: any) {
    console.error("[HELIUS-LISTENER-ERROR] Fehler beim Verarbeiten des Webhook-Events:", error);
    if (telegramToggles.global && telegramToggles.errors) {
      await sendTelegramSystemMessage({
        symbol: `Helius Listener Fehler`,
        message: `Kritischer Fehler im Helius Webhook Listener: ${error.message || error}`,
        isError: true,
      });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
