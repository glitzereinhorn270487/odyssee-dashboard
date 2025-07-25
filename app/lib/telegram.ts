// lib/telegram.ts

export async function sendTelegramBuyMessage({
  address,
  symbol,
  scoreX,
  fomoScore,
  pumpRisk,
}: {
  address: string;
  symbol: string;
  scoreX: number;
  fomoScore: string;
  pumpRisk: string;
}) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram API Token oder Chat ID nicht gesetzt. Kann Kauf-Nachricht nicht senden.");
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const message = `
<b>🛒 Neuer Token-Kauf!</b>
<b>Symbol:</b> ${symbol}
<b>Adresse:</b> ${address}
<b>ScoreX:</b> ${scoreX}
<b>FomoScore:</b> ${fomoScore}
<b>PumpRisk:</b> ${pumpRisk}
  `;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
    }),
  });
}

export async function sendTelegramSellMessage({
  address,
  symbol,
  scoreX,
  fomoScore,
  pumpRisk,
  reason,
  profit,
}: {
  address: string;
  symbol: string;
  scoreX: number;
  fomoScore: string;
  pumpRisk: string;
  reason: string;
  profit: number;
}) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram API Token oder Chat ID nicht gesetzt. Kann Verkauf-Nachricht nicht senden.");
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const message = `
<b>💰 Token verkauft!</b>
<b>Symbol:</b> ${symbol}
<b>Adresse:</b> ${address}
<b>Grund:</b> ${reason}
<b>Gewinn/Verlust:</b> ${profit > 0 ? "+" : ""}${profit.toFixed(2)}%
<b>ScoreX:</b> ${scoreX}
<b>FomoScore:</b> ${fomoScore}
<b>PumpRisk:</b> ${pumpRisk}
  `;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
    }),
  });
}

// KORREKTUR: Diese Funktion muss HIER stehen, auf der obersten Ebene des Moduls,
// NICHT innerhalb einer anderen Funktion.
export async function sendTelegramSystemMessage({
  symbol,
  message,
  isError = false, // Optional: Flag, ob es eine Fehlermeldung ist
}: {
  symbol: string; // Kurze Überschrift/Kategorie
  message: string; // Detaillierte Nachricht
  isError?: boolean;
}) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram API Token oder Chat ID nicht gesetzt. Kann System-Nachricht nicht senden.");
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  // Korrektur: HTML-Tags müssen korrekt sein (<b> statt b>) und Variablen korrekt interpoliert werden
  const formattedMessage = `
<b>${isError ? '❌ FEHLER' : 'ℹ️ SYSTEM-INFO'}: ${symbol}</b>
${message}
  `.trim();

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: formattedMessage,
      parse_mode: "HTML",
    }),
  });
}