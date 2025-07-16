import { NextResponse } from "next/server";
import { fetchNewRaydiumPools } from "@/lib/helius-raydium";
import { isTokenAlreadyTracked, trackTokenInRedis, getMonitoredWallets } from "@/lib/redis";
import { decideTrade } from "@/agent/trade-engine";
import { sendTelegramMessage } from "@/lib/telegram";
import { fetchFromHelius } from "@/lib/helius-logic"; // ggf. anpassen

// Globale Rate-Limit-Sperre (serverless-safe)
declare global {
  var lastCallTime: number | undefined;
}

const MAX_RETRIES = 5;

async function safeFetchFromHelius(wallet: string) {
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    try {
      return await fetchFromHelius(wallet);
    } catch (e: any) {
      if (e.message?.includes("429")) {
        retryCount++;
        const delay = 2 ** retryCount * 1000;
        console.warn(`[RateLimit] Retry ${retryCount}/${MAX_RETRIES} in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw e;
      }
    }
  }

  console.warn("[RateLimit] Max. Re-tries erreicht, breche Light-Modus ab.");
  return null;
}

export async function GET() {
  try {
    const now = Date.now();
    const lastCall = globalThis.lastCallTime || 0;

    if (now - lastCall < 15000) {
      return NextResponse.json(
        { success: false, message: "Rate limit schützt (15 Sek. Pause)" },
        { status: 429 }
      );
    }

    globalThis.lastCallTime = now;
    console.log("[AGENT-TICK] Pool-Scan läuft...");

    // Light-Modus aktivieren bis 24.07.
    const today = new Date();
    const isLightMode = today < new Date("2025-07-24");

    const monitored = await getMonitoredWallets();
    const selectedWallets = isLightMode ? mon
