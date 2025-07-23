import redis from "@/lib/redisClient";
import { investmentLevels, investLevelArray } from "@/lib/investment-level";
import { sendTelegramBuyMessage } from "@/lib/telegram";

const WALLET_ADDRESSES = [
  "WALLET_1_ADDRESS",
  "WALLET_2_ADDRESS",
  "WALLET_3_ADDRESS",
  "WALLET_4_ADDRESS",
  "WALLET_5_ADDRESS",
];

export async function checkAndReinvest() {
  let totalCapital = 0;

  // Kapital aller Wallets summieren
  for (const address of WALLET_ADDRESSES) {
    const capitalStr = await redis.get(`wallet:${address}:capital`);
    const capital = capitalStr ? parseFloat(capitalStr) : 0;
    totalCapital += capital;
  }

  // Aktuelle globale Stufe holen
  const currentLevel = await redis.get("wallet:global:level");

  // Passende neue Stufe bestimmen
  let newLevel = "NONE";
  for (const lvl of investLevelArray) {
    const stufen = investmentLevels[lvl];
    if (totalCapital >= stufen.minCapital && totalCapital <= stufen.maxCapital) {
      newLevel = lvl;
    }
  }

  if (newLevel !== currentLevel) {
    await redis.set("wallet:global:level", newLevel);

    await sendTelegramBuyMessage({
      address: "System",
      symbol: `📊 ${newLevel}`,
      scoreX: 0,
      fomoScore: "N/A",
      pumpRisk: "N/A",
    });

    console.log(`ℹ️ Neue Reinvest-Stufe gesetzt: ${newLevel}`);
  } else {
    console.log(`✅ Reinvest-Stufe unverändert: ${newLevel}`);
  }
}
