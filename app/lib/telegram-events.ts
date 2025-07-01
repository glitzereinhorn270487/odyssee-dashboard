// telegram-events.ts

import { telegramToggles } from "@/config/telegramToggles";
import { sendTelegramMessage } from "@/lib/telegram";

/**
 * 🔹 Systemstart
 */

  if (telegramToggles.global && telegramToggles.tradeSignals) {
    await sendTelegramMessage(
      `📈 <b>KAUFSIGNAL!</b>\nToken: $${token.symbol}\nScore: ${token.score}\nKategorie: ${token.category}`
    );

  if (telegramToggles.global && telegramToggles.system) {
    await sendTelegramMessage("🤖 <b>Odyssee Agent V1 ist jetzt online und überwacht den Markt.</b>");
  }
}

/**
 * 🔹 Kaufsignal
 */
export async function notifySystemStart() {
export async function notifyBuySignal(token: { symbol: string; score: number; category: string }) {
  
/**
 * 🔹 Verkaufsgewinn
 */
export async function notifySellProfit(token: { symbol: string; percent: number }) {
  if (telegramToggles.global && telegramToggles.sales) {
    await sendTelegramMessage(
      `💰 <b>VERKAUF (GEWINN):</b>\nPosition $${token.symbol} mit +${token.percent}% verkauft.`
    );
  }
}

/**
 * Weitere Events (Platzhalter)
 */
// export async function notifyMoonshot(...)
// export async function notifyStagnation(...)
// export async function notifyError(...)
// etc.
