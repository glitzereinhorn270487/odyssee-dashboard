// File: app/agent/trade-engine.ts

import { stufenConfig } from "@/config/stufenConfig";
import { getTokenScore, getRiskLevel, getBoostScore } from "@/lib/scoring";
import { decidePolice } from "@/lib/policy-decision";

export async function decideTrade(token: any, currentStufe: string) {
  const stufen = stufenConfig[currentStufe];

  const risk = await getRiskLevel(token);
  const score = await getTokenScore(token);
  const boost = await getBoostScore(token);

  const shouldBuy = score.baseScore >= stufen.minScore && risk <= stufen.maxRisk;

  if (!shouldBuy) return null;

  return {
    token,
    investmentAmount: stufen.capital,
    maxSlippage: stufen.slippage,
    police: decidePolice(token.category, score, boost, risk),
    reinvestStufe: currentStufe,
  };
}

