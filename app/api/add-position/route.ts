// app/api/add-position/route.ts
import { setRedisValue, getRedisValue } from "@/lib/redis";
import { telegramToggles } from "@/config/telegramToggles";
import { sendTelegramMessage } from "@/lib/telegram";
import { sendSellGain, sendSellLoss } from "@/lib/telegram-events";
import { ScoreX } from "@lib/utils/scorex";

  try {
    const data = await req.json();

    // 🔍 Automatische ScoreX-Auswertung
const scoreXResult = await ScoreX.evaluate(data.wallet, data.txs || []);
const calculatedScore = scoreXResult?.newData?.score || 0;
const calculatedBoosts = scoreXResult?.newData?.boosts || [];


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
    // ScoreX-Ergebnisse in Daten integrieren
    data.scoreX = calculatedScore;
    data.boosts = calculatedBoosts;

    {
      "token": "XYZ",
      "scoreX": 92,
      "boosts": ["Insider", "Momentum", "LetWinnersRun"]
    }

    // 🧠 Telegram-Benachrichtigungen
    const tokenSymbol = data.token?.toUpperCase?.() || "???";
    const gainPercent = data.gain || 150; // Beispielwert
    const lossPercent = data.loss || 50;  // Beispielwert

    if (telegramToggles.global && telegramToggles.tradeSignals) {
      await sendTelegramMessage(`📈 KAUFSIGNAL: $${tokenSymbol} | ScoreX: ${calculatedScore} | Boosts: ${calculatedBoosts.join(", ")}`);


    if (telegramToggles.global && telegramToggles.tradePerformance) {
      await sendSellGain(tokenSymbol, gainPercent); // Gewinn
      await sendSellLoss(tokenSymbol, lossPercent); // Verlust
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