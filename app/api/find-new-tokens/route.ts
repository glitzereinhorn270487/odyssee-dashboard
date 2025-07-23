import { ScoreX } from "@/lib/utils/scorex";
import { setRedisValue } from "@/lib/redis";
import redis from "@/lib/redisClient"; // Redis-Client muss importiert sein
import { runCrawler } from "@/lib/crawler/crawler";

export async function GET() {
  await runCrawler();


  console.log("[TEST-CRAWLER] Simulierter Aufruf mit Dummy-Wallet");

  const wallet = {
    address: "DUMMY123",
    cluster: "SmartMoney",
  };

  const fakeTxs = [
    { amount: 1.23, token: "USDC", timestamp: Date.now() },
    { amount: 4.56, token: "SOL", timestamp: Date.now() },
  ];



  // ✅ Timestamp zur Kontrolle speichern
  await setRedisValue("crawler:test:timestamp", { time: Date.now() });

  // ✅ Redis-Keys abrufen zur Debug-Kontrolle
  const allKeys = await redis.keys("*");
  console.log("[DEBUG] Aktuelle Redis-Keys:", allKeys);

  // ✅ ScoreX auswerten
  const evaluation = await ScoreX.evaluate(wallet.address, fakeTxs);
  console.log("[TEST-CRAWLER] Evaluation Ergebnis:", evaluation);

  // ✅ Optional: In Redis speichern, wenn neue Daten relevant sind
  if (evaluation.shouldUpdate) {
    console.log("[TEST-CRAWLER] Neuer Eintrag in Redis gespeichert.");
  }

  return new Response("Crawler ausgeführt", { status: 200 });
}
