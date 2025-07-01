// File: app/agent/trade-engine.ts

import { stufenConfig } from "@/config/stufenConfig";
import { getTokenScore, getRiskLevel, getBoostScore } from "@/lib/scoring";
import { decidePolice } from "@/lib/policy-decision";
import { sendTelegramMessage } from "@/lib/telegram";

export async function decideTrade(token: any, currentStufe: string) {

  const stufen = stufenConfig[currentStufe];

  const risk = await getRiskLevel(token);
  const score = await getTokenScore(token);
  const boost = await getBoostScore(token);

  let numericScore: number = typeof score === 'number' ? score : score.baseScore;

  const shouldBuy = numericScore >= stufen.minScore && risk <= stufen.maxRisk;

import { telegramToggles } from "@/config/telegramToggles";

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

