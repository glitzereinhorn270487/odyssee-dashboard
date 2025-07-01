// File: app/agent/evaluator.ts

import { getSocialBuzz, getSmartMoneyTags, getTelegramGroupPresence } from "@/lib/social-intel";
import { getScoreX, getBoostFactors } from "@/lib/scoring";

export async function evaluateToken(token: any) {
  const scoreX = await getScoreX(token.address);
  const socialBuzz = await getSocialBuzz(token.address);
  const smartMoney = await getSmartMoneyTags(token.address);
  const telegram = await getTelegramGroupPresence(token.address);

  return {
    scoreX,
    socialBuzz,
    smartMoney,
    telegram,
    boostFactors: await getBoostFactors(token),
  };
}