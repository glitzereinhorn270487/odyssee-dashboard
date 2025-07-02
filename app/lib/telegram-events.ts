// telegram-events.ts

import { telegramToggles } from "@/config/telegramToggles";
import { sendTelegramMessage } from "@/lib/telegram";


/**
 * 🔹 Systemstart
 */
export async function sendSellLoss(symbol: string, lossPercent: number) {
  if (telegramToggles.global && telegramToggles.tradePerformance) {
    await sendTelegramMessage(
      `❌ <b>VERKAUF (STOP-LOSS):</b>\nPosition $${symbol} bei -${lossPercent}% verkauft.`
    );
  }
}
export async function sendSellGain(symbol: string, gainPercent: number) {
  if (telegramToggles.global && telegramToggles.tradePerformance) {
    await sendTelegramMessage(
      `💰 <b>VERKAUF (GEWINN):</b>\nPosition $${symbol} mit +${gainPercent}% verkauft.`
    );
  }
}
export async function notifySystemStart() {
  if (telegramToggles.global && telegramToggles.system) {
    await sendTelegramMessage(
      "🤖 <b>Odyssee Agent V1 ist jetzt online und überwacht den Markt.</b>"
    );
  }
}

/**
 * 🔹 Kaufsignal
 */
export async function notifyBuySignal(token: {
  symbol: string;
  score: number;
  category: string;
}) {
  if (telegramToggles.global && telegramToggles.tradeSignals) {
    await sendTelegramMessage(
      `📈 <b>KAUFSIGNAL!</b>\nToken: $${token.symbol}\nScore: ${token.score}\nKategorie: ${token.category}`
    );
  }
}

/**
 * 🔹 Verkaufsgewinn
 */
export async function notifySellProfit(token: {
  symbol: string;
  percent: number;
}) {
  if (telegramToggles.global && telegramToggles.sales) {
    await sendTelegramMessage(
      `💰 <b>VERKAUF (GEWINN):</b>\nPosition $${token.symbol} mit +${token.percent}% verkauft.`
    );
  }
}

/**
 * 🔹 Verkaufsverlust
 */
export async function notifySellLoss(token: {
  symbol: string;
  percent: number;
}) {
  if (telegramToggles.global && telegramToggles.sales) {
    await sendTelegramMessage(
      `❌ <b>VERKAUF (VERLUST):</b>\nPosition $${token.symbol} bei -${token.percent}% verkauft.`
    );
  }
}