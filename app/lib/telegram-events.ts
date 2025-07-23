import { telegramToggles } from "@/config/telegramToggles";
import { sendTelegramBuyMessage, sendTelegramSellMessage } from "@/lib/telegram";

/**
 * 🔹 Verkaufsverlust
 */
export async function sendSellLoss({
  address,
  symbol,
  scoreX,
  fomoScore,
  pumpRisk,
  reason,
  profit,
}: {
  address: string;
  symbol: string;
  scoreX: number;
  fomoScore: string;
  pumpRisk: string;
  reason: string;
  profit: number;
}) {
  if (telegramToggles.global && telegramToggles.tradePerformance) {
    await sendTelegramSellMessage({
      address,
      symbol,
      scoreX,
      fomoScore,
      pumpRisk,
      reason,
      profit,
    });
  }
}

/**
 * 🔹 Verkaufsgewinn
 */
export async function sendSellGain({
  address,
  symbol,
  scoreX,
  fomoScore,
  pumpRisk,
  reason,
  profit,
}: {
  address: string;
  symbol: string;
  scoreX: number;
  fomoScore: string;
  pumpRisk: string;
  reason: string;
  profit: number;
}) {
  if (telegramToggles.global && telegramToggles.tradePerformance) {
    await sendTelegramSellMessage({
      address,
      symbol,
      scoreX,
      fomoScore,
      pumpRisk,
      reason,
      profit,
    });
  }
}

/**
 * 🔹 Systemstart
 */
export async function notifySystemStart({
  address,
  symbol,
  scoreX,
  fomoScore,
  pumpRisk,
}: {
  address: string;
  symbol: string;
  scoreX: number;
  fomoScore: string;
  pumpRisk: string;
}) {
  if (telegramToggles.global && telegramToggles.system) {
    await sendTelegramBuyMessage({
      address,
      symbol,
      scoreX,
      fomoScore,
      pumpRisk,
    });
  }
}

/**
 * 🔹 Kaufsignal
 */
export async function notifyBuySignal({
  address,
  symbol,
  scoreX,
  fomoScore,
  pumpRisk,
}: {
  address: string;
  symbol: string;
  scoreX: number;
  fomoScore: string;
  pumpRisk: string;
}) {
  if (telegramToggles.global && telegramToggles.tradeSignals) {
    await sendTelegramBuyMessage({
      address,
      symbol,
      scoreX,
      fomoScore,
      pumpRisk,
    });
  }
}
