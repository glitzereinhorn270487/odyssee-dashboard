// File: app/agent/trade-engine.ts

import { stufenConfig } from "@/config/stufenConfig";
import { getTokenScore, getRiskLevel, getBoostScore } from "@/lib/scoring";
import { decidePolice } from "@/lib/policy-decision";
import { sendTelegramMessage } from "@/lib/telegram";
import { telegramToggles } from "@/config/telegramToggles";
import { notifyBuySignal } from "@/lib/telegram-events";
import { notifySellLoss } from "@/lib/telegram-events";
import { notifySellProfit } from "@/lib/telegram-events";

await notifyBuySignal({
  symbol: token.symbol,
  score: score.totalScore,
  category: token.category
});

export async function decideTrade(token: any, currentStufe: string) {

  const stufen = stufenConfig[currentStufe];

  const risk = await getRiskLevel(token);
  const score = await getTokenScore(token);
  const boost = await getBoostScore(token);

  let numericScore: number = typeof score === 'number' ? score : score.baseScore;

  const shouldBuy = numericScore >= stufen.minScore && risk <= stufen.maxRisk;

// ...

if (telegramToggles.global && telegramToggles.tradeSignals) {
  await sendTelegramMessage(
    `📈 <b>KAUFSIGNAL!</b>\nToken: $${token.symbol}\nScore: ${numericScore}\nKategorie: ${token.category}`
  );
}
  
  if (!shouldBuy) return null;

  return {
    token,
    investmentAmount: stufen.kapital,
    maxSlippage: stufen.maxSlippage,
    police: decidePolice(token.category, numericScore, boost),
    reinvestStufe: currentStufe,
  };
}

