import { NextResponse } from "next/server";
import { fetchNewRaydiumPools } from "@/lib/helius-raydium";
import { decideTrade } from "@/agent/trade-engine";
import { isHoneypot } from "@/lib/honeypotCheck";
import { getRedisValue, setRedisValue } from "@/lib/redis"; // Upstash Redis REST
import { sendTelegramMessage } from "@/lib/telegram";

export async function GET() {
  try {
    const pools = await fetchNewRaydiumPools();

    if (!pools || pools.length === 0) {
      return NextResponse.json({ success: true, message: "Keine neuen Pools" });
    }

    let newTrades = 0;
      const lastCall = globalThis.lastCallTime || 0;
const now = Date.now();
if (now - lastCall < 30000) {
  return NextResponse.json({ success: false, message: "Rate limit schützt" }, { status: 429 });
}
globalThis.lastCallTime = now;
    for (const pool of pools) {
      const { tokenAddress, tokenSymbol, tokenName } = pool;

      // Doppel-Check via Upstash
      const alreadyTracked = await getRedisValue(`live:${tokenAddress}`);
      if (alreadyTracked) continue;

      // Honeypot-Schutz
      const isTrap = await isHoneypot(tokenAddress);
      if (isTrap) continue;

      // Entscheidungslogik
      const decision = await decideTrade({
        address: tokenAddress,
        symbol: tokenSymbol,
        name: tokenName,
        category: "moonshot",
      }, "M1");

      if (decision?.shouldBuy) {
        await sendTelegramMessage(`📈 Paper-Trade für $${tokenSymbol} ausgelöst`);
        await setRedisValue(`live:${tokenAddress}`, decision); // Nur speichern wenn Trade
        newTrades++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${newTrades} neue Trades ausgelöst`,
    });

  } catch (err: any) {
    console.error("[AGENT-TICK ERROR]", err);
    return NextResponse.json({ success: false, error: err?.message || "Unbekannter Fehler" }, { status: 500 });
  }
}
