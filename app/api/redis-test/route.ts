import { getRedisValue, setRedisValue } from "@/lib/redis";

// Beispieltoken – kannst du später dynamisch ersetzen
const tokenAddress = "abc123";
const tradeData = {
  symbol: "EXAMPLE",
  score: 97,
  timestamp: Date.now(),
};

export async function GET() {
  try {
    const alreadyTracked = await getRedisValue(`live:${tokenAddress}`);
    if (alreadyTracked) {
      return new Response("🚫 Schon getrackt", { status: 200 });
    }

    await setRedisValue(`live:${tokenAddress}`, tradeData);
    return new Response("✅ Erfolgreich gespeichert", { status: 200 });
  } catch (error: any) {
    console.error("[REDIS-TEST-ERROR]", error);
    return new Response(`❌ Fehler: ${error.message || "Unbekannter Fehler"}`, {
      status: 500,
    });
  }
}
