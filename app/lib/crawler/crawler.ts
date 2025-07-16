import { ScoreX } from "@/lib/utils/scorex";
import { setRedisValue, addWalletToDB } from "@/lib/redis";
export async function runCrawler() {
  const wallet = { address: "DUMMY123", cluster: "SmartMoney" };

  const fakeTxs = [
    { amount: 1.23, token: "USDC", timestamp: Date.now() },
    { amount: 4.56, token: "SOL", timestamp: Date.now() },
  ];

  console.log("[TEST-CRAWLER] Simulierter Aufruf mit Dummy-Wallet");
  await setRedisValue("crawler:test:timestamp", { time: Date.now() });

const testKeys = await redis.keys("*");
console.log("[DEBUG] Aktuelle Redis-Keys:", testKeys);

  const evaluation = await ScoreX.evaluate(wallet.address, fakeTxs);

  console.log("[TEST-CRAWLER] Evaluation Ergebnis:", evaluation);

  if (evaluation.shouldUpdate) {
    await addWalletToDB(wallet.address, JSON.stringify(evaluation.newData));
    console.log("[TEST-CRAWLER] Neuer Eintrag in Redis gespeichert.");
  }
}
