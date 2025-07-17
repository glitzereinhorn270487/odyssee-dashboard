import { ScoreX } from "@/lib/utils/scorex";
import { redis,setRedisValue, addWalletToDB } from "@/lib/redis";
export async function runCrawler() {
  const wallet = { address: "DUMMY123", cluster: "SmartMoney" };

  const fakeTxs = [
    { amount: 1.23, token: "USDC", timestamp: Date.now() },
    { amount: 4.56, token: "SOL", timestamp: Date.now() },
  ];

  console.log("[TEST-CRAWLER] Simulierter Aufruf mit Dummy-Wallet");
  await setRedisValue("crawler:test:timestamp", { time: Date.now() });


console.log("[DEBUG] Aktuelle Redis-Keys:", allKeys);
  if (!redis) {
    console.error("Redis nicht initialisiert!");
    return;
  }
  const evaluation = await ScoreX.evaluate(wallet.address, fakeTxs);

  console.log("[TEST-CRAWLER] Evaluation Ergebnis:", evaluation);

  if (evaluation.shouldUpdate) {
    await addWalletToDB(wallet.address, JSON.stringify(evaluation.newData));
    console.log("[TEST-CRAWLER] Neuer Eintrag in Redis gespeichert.");
  }
}
