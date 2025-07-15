// File: app/agent/trade-engine.ts

import { stufenConfig } from "@/config/stufenConfig";
import { getTokenScore, getRiskLevel, getBoostScore } from "@/lib/scoring";
import { decidePolice } from "@/lib/policy-decision";
import { sendTelegramMessage } from "@/lib/telegram";
import { telegramToggles } from "@/config/telegramToggles";
import { notifyBuySignal, notifySellLoss, notifySellProfit } from "@/lib/telegram-events";

export async function decideTrade(token: any, currentStufe: string) {
  const { symbol, category } = token;
  const stufen = stufenConfig[currentStufe];

  const risk = await getRiskLevel(token);
  const score = await getTokenScore(token);
  const boostScore = await getBoostScore(token);
  const boosts = token.boosts ?? []; // wichtige Änderung
  const numericScore: number = typeof score === "number" ? score : score.baseScore;

  const shouldBuy = numericScore >= stufen.minScore && risk <= stufen.maxRisk;

  if (shouldBuy) {
    // Hauptnachricht über Telegram senden
    if (telegramToggles.global && telegramToggles.tradeSignals) {
      await sendTelegramMessage(
        `📈 <b>KAUFSIGNAL!</b>\nToken: $${token.symbol}\nScore: ${numericScore}\nKategorie: ${token.category}`
      );
    }

    // Alternative strukturierte Nachricht
    await notifyBuySignal({
       symbol: token.symbol,
       score: typeof score === "number" ? score : score.totalScore,
       category: token.category
     });

    return {
      token,
      investmentAmount: stufen.kapital,
      maxSlippage: stufen.maxSlippage,
      police: decidePolice(token.category, numericScore, boosts),
      reinvestStufe: currentStufe,
      shouldBuy: true // Optional, falls in route.ts genutzt
    };
  }

  return null;
}
