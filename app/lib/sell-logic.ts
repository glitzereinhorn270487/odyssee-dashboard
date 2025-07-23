import { sendTelegramSellMessage } from "@/lib/telegram";
import { getLivePrice } from "@/lib/price-manager";

export async function checkAndSellPosition(position: any) {
  const currentPrice = await getLivePrice(position.address);
  const entryPrice = position.entryPrice;
  const gain = ((currentPrice - entryPrice) / entryPrice) * 100;

  let shouldSell = false;
  let reason = "";

  if (gain >= 100) {
    shouldSell = true;
    reason = "+100% Gewinn erreicht";
  } else if (gain <= -25) {
    shouldSell = true;
    reason = "-25% Stop-Loss ausgelöst";
  }

  if (shouldSell) {
    await sendTelegramSellMessage({
      address: position.address,
      symbol: position.symbol,
      scoreX: position.scoreX || 0,
      fomoScore: position.fomoScore || "unbekannt",
      pumpRisk: position.pumpRisk || "unbekannt",
      reason,
      profit: gain,
    });

    // Optional: Position aus DB löschen (wenn gewünscht)
    console.log(`✅ Verkauft: ${position.symbol} mit ${gain.toFixed(2)}%`);
  }
}
