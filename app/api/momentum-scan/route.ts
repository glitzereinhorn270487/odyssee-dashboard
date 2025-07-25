// app/api/momentum-scan/route.ts

import { NextResponse } from "next/server";
import { isTokenAlreadyTracked } from "@/lib/redis";
import { decideTrade } from "@/agent/trade-engine";
import { TradeCandidate } from "@/types/token"; // Annahme, dass der Typ hier liegt

interface DexScreenerPair {
  baseToken: {
    address: string;
    symbol: string;
    name: string;
  };
  priceChange: {
    m5: number; // Preisänderung in den letzten 5 Minuten
    h1: number; // Preisänderung in der letzten Stunde
  };
  volume: {
    h1: number; // Volumen in der letzten Stunde
  };
  pairCreatedAt: number;
}

/**
 * Holt die Top 20 nach Volumen der letzten Stunde von DEXScreener.
 */
async function fetchTopVolumeTokens(): Promise<DexScreenerPair[]> {
  try {
    const url = "https://api.dexscreener.com/latest/dex/tokens/solana?sort_by=volume&order=desc&limit=20";
    const response = await fetch(url);
    if (!response.ok) throw new Error(`DEXScreener API Error: ${response.status}`);
    const data = await response.json();
    return data.pairs || [];
  } catch (error) {
    console.error("[MomentumScanner] Fehler beim Abrufen der Top-Volumen-Token:", error);
    return [];
  }
}


export async function GET() {
  console.log("[MomentumScanner] Starte periodischen Scan...");

  try {
    const topTokens = await fetchTopVolumeTokens();

    let newCandidates = 0;

   // app/api/momentum-scan/route.ts
// ... (bestehender Code darüber)

    for (const token of topTokens) {
      const tokenAddress = token.baseToken.address; 

      // ... (Filterungen) ...

      // KORREKTUR: Sicherstellen, dass address, symbol und name definitiv Strings sind.
      // Wir verwenden den Nullish Coalescing Operator (??) um einen leeren String als Fallback zu geben,
      // falls DexScreener.com unerwartet undefined liefert.
      const candidate = { 
        address: tokenAddress, // Dies sollte immer ein String sein
        symbol: token.baseToken.symbol ?? '', // Sicherstellen, dass es ein String ist
        name: token.baseToken.name ?? '',     // Sicherstellen, dass es ein String ist
      };

      // Der Typ von 'candidate' ist jetzt { address: string; symbol: string; name: string; }
      const decision = await decideTrade(candidate); // <-- Jetzt sollte es passen

// ... (restlicher Code darunter)

      if (decision?.shouldBuy) {
        // Hier würde die Kauflogik (im Paper-Trade-Modus) folgen.
        console.log(`[MomentumScanner] KAUFENTSCHEIDUNG für ${candidate.symbol} mit Score ${decision.finalScore}`);
        // await executePaperTrade(candidate, decision);
      }
    }

    return NextResponse.json({ success: true, message: `Scan beendet. ${newCandidates} neue Kandidaten gefunden.` });

  } catch (error: any) {
    console.error("[MomentumScanner-ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}