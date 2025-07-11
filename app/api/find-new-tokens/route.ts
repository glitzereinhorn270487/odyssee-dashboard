// app/api/find-new-tokens/route.ts

import { decideTrade } from "@/agent/trade-engine";
import { fetchNewRaydiumPools } from "@/lib/helius-raydium";
import { isTokenAlreadyTracked, trackTokenInRedis } from "@/lib/redis";

export async function GET() {
  console.log("[LISTENER] Starte Pool-Scan");

  const pools = await fetchNewRaydiumPools();
  let tradeCount = 0;

  for (const token of pools) {
    const alreadyTracked = await isTokenAlreadyTracked(`live:${token.tokenAddress}`);
    if (alreadyTracked) continue;

    const decision = await decideTrade(token, "M0");
    if (decision) {
      console.log(`✅ PAPER-TRADE für ${token.tokenSymbol}`);
      await trackTokenInRedis(`live:${token.tokenAddress}`, decision);
      tradeCount++;
    }
  }

  return new Response(`✅ ${tradeCount} neue Paper-Trades`, { status: 200 });
}
