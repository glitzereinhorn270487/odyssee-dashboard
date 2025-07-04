// app/api/add-position/route.ts
import { redis } from "/vercel/path0/app/lib/redis";
import { telegramToggles } from "@/config/telegramToggles";
import { sendTelegramMessage } from "@/lib/telegram";
import { sendSellGain, sendSellLoss } from "@/lib/telegram-events";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // ✅ Prüfung auf gültige Daten
    if (!data.token || !data.wallet || !data.cluster) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    // 🧠 Telegram-Benachrichtigungen
    const tokenSymbol = data.token?.toUpperCase?.() || "???";
    const gainPercent = data.gain || 150; // Beispielwert
    const lossPercent = data.loss || 50;  // Beispielwert

    if (telegramToggles.global && telegramToggles.tradeSignals) {
      await sendTelegramMessage(`📈 KAUFSIGNAL: $${tokenSymbol}`);
    }

    if (telegramToggles.global && telegramToggles.tradePerformance) {
      await sendSellGain(tokenSymbol, gainPercent); // Gewinn
      await sendSellLoss(tokenSymbol, lossPercent); // Verlust
    }

    // ✅ Redis speichern
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
        },
      }
    );
  }
}