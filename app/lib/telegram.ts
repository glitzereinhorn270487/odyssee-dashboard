// lib/telegram.ts
export async function sendTelegramMessage(message: string) {
  const TELEGRAM_BOT_TOKEN = process.env.7633687305:AAEvjchGHkQAB0uX8jHLLK-QuMiyMOaPiSQ;
  const TELEGRAM_CHAT_ID = process.env.7590980638;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram-Daten fehlen in .env");
    return;
  }

  const url = `https://api.telegram.org/bot7633687305:AAEvjchGHkQAB0uX8jHLLK-QuMiyMOaPiSQ/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
    }),
  });
}

// lib/classifier.ts
export function isInsider(wallet: string): boolean {
  return wallet.startsWith("INS");
}

export function isSmartMoney(wallet: string): boolean {
  return wallet.startsWith("SM");
}

export function isRedFlag(wallet: string): boolean {
  return wallet.startsWith("RUG");
}

export function isViralX(source: string): boolean {
  return source.toLowerCase().includes("elon") || source.includes("meme");
}

export function isNarrativeMaker(source: string): boolean {
  return source.toLowerCase().includes("narrative") || source.includes("theme");
}

// lib/helius-logic.ts
export async function fetchNewPools() {
  const res = await fetch("https://api.helius.xyz/v0/pools?since=60", {
    headers: { "Authorization": `Bearer ${process.env.Helius_API_Key}` }
  });
  const data = await res.json();
  return data.pools || [];
}

export async function analyseToken(pool: any) {
  // Platzhalter-Analyse-Logik – später durch echte ersetzt
  return {
    token: pool.tokenSymbol,
    wallet: pool.creator,
    source: pool.tweet || "",
    alphaScore: Math.floor(Math.random() * 100),
    cluster: "Unknown"
  };
}

// lib/price-manager.ts
export async function getLivePrice(token: string) {
  const res = await fetch(`https://price-api.example.com/token/${token}`);
  const data = await res.json();
  return data.price;
}

export function checkSellRules(position: any, currentPrice: number) {
  const buyPrice = position.entryPrice;
  const gain = (currentPrice - buyPrice) / buyPrice;

  if (gain >= 2) {
    return { shouldSell: true, reason: "+100% Gewinn erreicht" };
  }
  if (gain <= -0.25) {
    return { shouldSell: true, reason: "Stop-Loss ausgelöst" };
  }

  return { shouldSell: false, reason: "" };
}
