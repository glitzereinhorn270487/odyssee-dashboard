// app/api/manage-positions/route.ts
import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { getLivePrice, checkSellRules } from "@/lib/price-manager";
import { sendTelegramMessage } from "@/lib/telegram";

export async function GET() {
  try {
    const keys = await redis.keys("position:*");
    if (!keys.length) {
      return NextResponse.json({ status: "Keine offenen Positionen gefunden" });
    }

    for (const key of keys) {
      const raw = await redis.get(key);
      if (!raw) continue;

      const position = JSON.parse(raw);
      const currentPrice = await getLivePrice(position.token);

      const { shouldSell, reason } = checkSellRules(position, currentPrice);

      if (shouldSell) {
        await redis.del(key);
        await sendTelegramMessage(`📉 Verkauf von ${position.token}: Grund: ${reason}`);
      }
    }

    return NextResponse.json({ status: "Alle Positionen überprüft", count: keys.length });
  } catch (error) {
    return NextResponse.json({ error: "Fehler bei Positionen", detail: error }, { status: 500 });
  }
}