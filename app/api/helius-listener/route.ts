import { fetchRecentRaydiumTokens } from "@/lib/token-fetcher";
import { isTokenAlreadyTracked, trackTokenInRedis } from "@/lib/redis";
import { decideTrade } from "@/agent/trade-engine";
import { sendTelegramBuyMessage } from "@/lib/telegram";
import { telegramToggles } from "@/config/telegramToggles";

export async function GET() {
  console.log("[HELIUS-LISTENER] Cron Job triggered");

  let newTrades = 0;
  const tokens = await fetchRecentRaydiumTokens();

  for (const token of tokens) {
    const alreadyTracked = await isTokenAlreadyTracked(`live:${token.address}`);
    if (alreadyTracked) continue;

    const decision = await decideTrade(token, "M0");

    if (decision && decision.shouldBuy) {
      if (telegramToggles.global && telegramToggles.tradeSignals) {
        await sendTelegramBuyMessage({
          address: token.address,
          symbol: token.symbol,
          scoreX: decision.scoreX,
          fomoScore: token.fomoScore || "unbekannt",
          pumpRisk: token.pumpRisk || "unbekannt",
        });
      }

      await trackTokenInRedis(`live:${token.address}`, {
        address: token.address,
        symbol: token.symbol,
        scoreX: decision.scoreX,
        boosts: decision.boosts || [],
        timestamp: Date.now(),
      });

      console.log(`✅ Paper-Trade für ${token.symbol} ausgelöst.`);
      newTrades++;
    }
  }

  return new Response(
    `✅ Listener abgeschlossen – ${newTrades} neue Paper-Trades gestartet.`,
    { status: 200 }
  );
}
