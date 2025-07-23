import { getTokenScores } from "@/lib/redis" // Passe den Pfad ggf. an

export async function sendTelegramBuyMessage(token: { address: string, symbol: string }, scoreX: number) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  // Hole FomoScore und PumpRisk aus Redis
  const { fomoScore, pumpRisk } = await getTokenScores(token.address);

  // Erstelle Nachricht
  const message = `
🚀 <b>Neuer Token-Kauf</b>: ${token.symbol}
📊 ScoreX: ${scoreX}
📈 Fomo Score: ${fomoScore}
⚠️ Pump & Dump Risiko: ${pumpRisk}
  `.trim();

  // Telegram-Anfrage senden
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML", // unterstützt <b>, <i>, <br> etc.
    }),
  });

  // Fehlerausgabe bei Problemen
  if (!res.ok) {
    console.error("❌ Telegram Error:", await res.text());
  }
}
