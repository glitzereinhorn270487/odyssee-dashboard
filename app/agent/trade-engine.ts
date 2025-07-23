// 🔁 trade-engine.ts (app/agent/trade-engine.ts)

import { getLivePrice, checkSellRules } from "@/lib/price-manager";
import { sendTelegramBuyMessage, sendTelegramSellMessage } from "@/lib/telegram";
import { getScoreX } from "@/lib/scoring";
import { getRedisValue, setRedisValue } from "@/lib/redis";
import { telegramToggles } from "@/config/telegramToggles";
import { investmentLevels, getInvestmentLevel } from "@/lib/investment-level";

export async function tradeToken(token: any) {
  const tokenAddress = token.address;
  const tokenSymbol = token.symbol;

  const scoreX = await getScoreX(tokenAddress);
  const fomoScore = token.fomoScore || "nicht bekannt";
  const pumpRisk = token.pumpRisk || "nicht bekannt";

  const currentWallet = token.wallet || "wallet1";
  console.log("DEBUG Wallet", currentWallet);

  const freeCapital = (await getRedisValue<number>("freeCapital")) || 0;
  const levelKey = getInvestmentLevel(freeCapital);
  const stufen = investmentLevels[levelKey];
  const numericScore = scoreX;
  const risk = token.riskScore || 0;

  const shouldBuy = numericScore >= stufen.minScore && risk <= stufen.maxRisk;

  if (shouldBuy) {
    if (telegramToggles.global && telegramToggles.tradeSignals) {
      await sendTelegramBuyMessage({
        address: tokenAddress,
        symbol: tokenSymbol,
        scoreX,
        fomoScore,
        pumpRisk,
      });
    }

    await setRedisValue(`position:${tokenAddress}`, {
      address: tokenAddress,
      symbol: tokenSymbol,
      entryPrice: token.price || 1,
      scoreX,
      fomoScore,
      pumpRisk,
      timestamp: Date.now(),
    });
  }
}

export async function decideTrade(token: any, level: string) {
  const scoreX = Math.floor(Math.random() * 100);
  const boosts = scoreX > 70 ? ["SmartMoney", "TelegramGroup"] : [];
  const shouldBuy = scoreX > 68;
  const berechneterFomoScore = 75;
  const berechnetesPumpRisiko = "Niedrig";

  return {
    shouldBuy: true,
    level: "M1",
    scoreX: 85,
    boosts: ["Insider"],
    fomoScore: berechneterFomoScore,
    pumpRisk: berechnetesPumpRisiko,
  };
}

export async function checkForSell(token: any) {
  const tokenAddress = token.address;

  type StoredPosition = {
    symbol: string;
    address: string;
    entryPrice: number;
    scoreX: number;
    fomoScore: string;
    pumpRisk: string;
  };

  const openPosition = (await getRedisValue<any>(`position:${tokenAddress}`)) || {};
  if (!openPosition || !openPosition.entryPrice) return;

  const currentPrice = await getLivePrice(tokenAddress);
  const result = checkSellRules(openPosition, currentPrice);

  if (result.shouldSell) {
    const profit = ((currentPrice - openPosition.entryPrice) / openPosition.entryPrice) * 100;

    await sendTelegramSellMessage({
      address: tokenAddress,
      symbol: openPosition.symbol,
      scoreX: openPosition.scoreX,
      fomoScore: openPosition.fomoScore,
      pumpRisk: openPosition.pumpRisk,
      reason: result.reason,
      profit,
    });

    await setRedisValue(`position:${tokenAddress}`, null);
  }
}
