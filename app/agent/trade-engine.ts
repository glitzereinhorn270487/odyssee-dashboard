// File: app/agent/trade-engine.ts

import { stufenConfig } from "@/config/stufenConfig";
import { getTokenScore, getRiskLevel, getBoostScore } from "@/lib/scoring";
import { decidePolice } from "@/lib/policy-decision";

export async function decideTrade(token: any, currentStufe: string) {
  const stufen = stufenConfig[currentStufe];

  const risk = await getRiskLevel(token);
  const score = await getTokenScore(token);
  const boost = await getBoostScore(token);

  let numericScore: number = typeof score === 'number' ? score : score.baseScore;

  const shouldBuy = numericScore >= stufen.minScore && risk <= stufen.maxRisk;

  if (!shouldBuy) return null;

  return {
    token,
    investmentAmount: stufen.kapital,
    maxSlippage: stufen.maxSlippage,
    police: decidePolice(token.category, score, boost, risk),
    reinvestStufe: currentStufe,
  };
}

