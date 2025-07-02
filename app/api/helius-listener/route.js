import { decideTrade } from "@/app/agent/trade-engine";
import { fetchRecentRaydiumTokens } from "@/lib/token-fetcher"; // Diese Funktion musst du ggf. selbst schreiben
import { isTokenAlreadyTracked } from "@/lib/redis"; // Token-Tracking-Cache zur Duplikatvermeidung

export async function GET() {
  console.log("[HELIUS-LISTENER] Cron Job triggered");

  const tokens = await fetchRecentRaydiumTokens(); // z. B. von Helius
  let newTrades = 0;

  for (const token of tokens) {
    const alreadyTracked = await isTokenAlreadyTracked(token.address);
    if (alreadyTracked) continue;

    const tradeDecision = await decideTrade(token, "M0");

    if (tradeDecision) {
      console.log(`✅ Paper-Trade für ${token.symbol} ausgelöst.`);
      newTrades++;
    }
  }

  return new Response(
    `Listener durchlaufen – ${newTrades} neue Paper-Trades gestartet.`,
    { status: 200 }
  );
}