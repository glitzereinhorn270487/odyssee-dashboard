// app/api/add-position/route.ts

import { setRedisValue } from "@/lib/redis";
import { telegramToggles } from "@/config/telegramToggles";
import { sendTelegramMessage } from "@/lib/telegram";
import { sendSellGain, sendSellLoss } from "@/lib/telegram-events";
import { calculateScoreX } from "@/lib/utils/scorex";

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

    // ✅ ScoreX berechnen
    const { score, boosts } = calculateScoreX(data.token);
    data.scoreX = score;
    data.boosts = boosts;

    // 🧠 Telegram-Benachrichtigungen
    const tokenSymbol = data.token?.toUpperCase?.() || "???";
    const gainPercent = data.gain || 150;
    const lossPercent = data.loss || 50;

    if (telegramToggles.global && telegramToggles.tradeSignals) {
      await sendTelegramMessage(`📈 KAUFSIGNAL: $${tokenSymbol}`);
    }

    if (telegramToggles.global && telegramToggles.tradePerformance) {
      await sendSellGain(tokenSymbol, gainPercent);
      await sendSellLoss(tokenSymbol, lossPercent);
    }

    // ✅ Redis speichern
    await setRedisValue(`live:${data.token}`, data);

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
