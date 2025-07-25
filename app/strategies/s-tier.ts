// app/strategies/s-tier.ts

import { TradeCandidate } from "@/types/token";
// KORREKTUR: 'notifyBuySignal' existiert nicht in telegram-events.
// Stattdessen importieren wir 'sendTelegramBuyMessage' aus '@/lib/telegram'.
import { sendTelegramBuyMessage } from "@/lib/telegram"; 
import { ScoreXEngine } from "@/lib/scoring"; // Importiere ScoreXEngine zur Bewertung
import { Helius } from "helius-sdk"; // Helius-Instanz für Datenabruf
// Importiere benötigte Helper-Funktionen aus trade-engine.ts oder lib/redis.ts
// Annahme: Diese Funktionen sind exportiert oder werden hier direkt implementiert/simuliert.
import { 
  checkLpStatus, 
  getGiniCoefficient, 
  getTopHolderShare, 
  getEarlyBuyers 
} from "@/agent/trade-engine"; // Annahme: Diese sind dort exportiert
import { getMonitoredWallets, getSmartMoneyWallets } from "@/lib/redis"; // Wallets aus Redis

/**
 * Führt die S-Tier-Strategie für einen gegebenen Token aus.
 * Diese Strategie ist für hochqualitative Signale mit hohem Potenzial.
 * @param token Das TradeCandidate-Objekt, das bewertet werden soll.
 */
export async function executeS_TierStrategy(token: TradeCandidate) {
  // Stelle sicher, dass der Helius API Key gesetzt ist
  if (!process.env.HELIUS_API_KEY) {
    console.error("[S-Tier Strategy] Helius API Key ist nicht gesetzt. Strategie kann nicht ausgeführt werden.");
    return;
  }
  const helius = new Helius(process.env.HELIUS_API_KEY);

  try {
    // 1. Daten für die ScoreXEngine sammeln
    const [lpIsLocked, gini, topHolderShare, earlyBuyers, insiderWallets, smartMoneyWallets] = await Promise.all([
      checkLpStatus(helius, token.address),
      getGiniCoefficient(helius, token.address),
      getTopHolderShare(helius, token.address),
      getEarlyBuyers(helius, token.address),
      getMonitoredWallets(), 
      getSmartMoneyWallets(), 
    ]);

    const insiderHits = earlyBuyers.filter(buyer => insiderWallets.includes(buyer)).length;
    const smartMoneyHits = earlyBuyers.filter(buyer => smartMoneyWallets.includes(buyer)).length;

    const tokenData = {
      address: token.address,
      lpIsLocked,
      gini,
      topHolderShare,
      insiderHits,
      smartMoneyHits,
    };

    // 2. Token mit ScoreXEngine bewerten
    const scoringEngine = new ScoreXEngine(tokenData);
    const scoreResult = scoringEngine.evaluateToken(); // Dies gibt ScoreXResult zurück

    console.log(`[S-Tier Strategy] Bewertung für ${token.symbol}:`, scoreResult);

    // 3. Entscheidung basierend auf ScoreX und S-Tier-Kriterien
    // Annahme: Ein Score von >= 90 ist ein S-Tier-Signal
    if (scoreResult.finalScore >= 90) {
      console.log(`[S-Tier Strategy] S-Tier Signal für ${token.symbol} erkannt! Score: ${scoreResult.finalScore}`);
      
      // KORREKTUR: Aufruf von sendTelegramBuyMessage mit den korrekten Parametern
      await sendTelegramBuyMessage({
        address: token.address,
        symbol: token.symbol,
        scoreX: scoreResult.finalScore,
        fomoScore: scoreResult.pumpRisk, // Verwende pumpRisk als fomoScore für jetzt
        pumpRisk: scoreResult.pumpRisk,
      });

      // Hier würde die eigentliche Kauflogik für S-Tier-Trades folgen (z.B. mit höherem Einsatz)
      // await executeHighCapitalTrade(token, scoreResult); 

    } else {
      console.log(`[S-Tier Strategy] ${token.symbol} erreicht kein S-Tier (Score: ${scoreResult.finalScore}).`);
    }

  } catch (error) {
    console.error(`[S-Tier Strategy] Fehler bei der Ausführung der S-Tier Strategie für ${token.symbol}:`, error);
    // Optional: Sende eine System-Fehlermeldung via Telegram
    // await sendTelegramSystemMessage({ symbol: "S-Tier Fehler", message: `Strategie-Fehler für ${token.symbol}: ${error}`, isError: true });
  }
}
