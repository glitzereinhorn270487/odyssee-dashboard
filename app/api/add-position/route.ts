// app/api/add-position/route.ts
import redis from "@/lib/redis"; // sicherstellen, dass Pfad stimmt
import { telegramToggles } from "@/config/telegramToggles";
import { sendTelegramMessage } from "@/lib/telegram";
import { sendSellGain, sendSellLoss } from "@/lib/telegram-events";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (telegramToggles.global && telegramToggles.tradeSignals) {
  await sendTelegramMessage(`📈 KAUFSIGNAL: $${token.symbol}`);
}

if (telegramToggles.global && telegramToggles.tradePerformance) {
  await sendTelegramMessage(`💰 VERKAUF (GEWINN): ${token.symbol} mit +${gainPercent}%`);
}

// bei Gewinnverkauf
if (telegramToggles.global && telegramToggles.tradePerformance) {
  await sendSellGain(token.symbol, 150); // Beispielwert
}

// bei Verlustverkauf
if (telegramToggles.global && telegramToggles.tradePerformance) {
  await sendSellLoss(token.symbol, 50); // Beispielwert
}
    if (!data.token || !data.wallet || !data.cluster) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    await redis.set(`live:${data.token}`, JSON.stringify(data));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    console.error("REDIS ERROR:", err);
    return new Response(
      JSON.stringify({
        error: "Invalid JSON or Redis error",
        detail: err?.message || "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        }
