import { decideTrade } from "@/agent/trade-engine";
import { fetchNewRaydiumPools } from "@/lib/helius-raydium";
import { isTokenAlreadyTracked, trackTokenInRedis } from "@/lib/redis";
import { isHoneypot } from "@/lib/honeypotCheck";

export async function GET() {
  console.log("[HELIUS-LISTENER] getriggert via /agent-tick");

  const tokens = await fetchNewRaydiumPools();
  let newTrades = 0;

  for (const token of tokens) {
    const alreadyTracked = await isTokenAlreadyTracked(token.address);
    if (alreadyTracked) continue;

    const honeypot = await isHoneypot(token.address);
    if (honeypot) {
      console.log(`⛔ BLOCKIERT (HONEYPOT): ${token.symbol}`);
      continue; // ✅ jetzt korrekt
    }

    const tradeDecision = await decideTrade(token, "M0");

    if (tradeDecision) {
      console.log(`✅ Paper-Trade für ${token.symbol} ausgelöst.`);
      await trackTokenInRedis(token.address); // ✅ nicht doppelt ausführen
      newTrades++;
    }
  }

  return new Response(
    `Listener durchlaufen – ${newTrades} neue Paper-Trades gestartet.`,
    { status: 200 }
  );
}