// app/api/live-positions/route.ts
import { getAllKeys, getRedisValue } from "@/lib/redis";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
  console.log("\n--- [START] API-Anfrage an /api/live-positions ---");

  try {
    const testValue = await getRedisValue("test_key");
    console.log(`[INFO] Test-Wert aus Redis gelesen: "${testValue}"`);

    // 🔧 Beispielhafte Dummy-Daten (Live-Trades später hier laden)
    const dummyData = [
      {
        tradeId: "test1",
        tokenSymbol: "TEST",
        initialInvestmentUsd: 100,
        currentValueUsd: 110,
        pnlPercentage: 10,
      },
    ];
    const keys = await getAllKeys();
    const liveKeys = keys.filter(k=> k.startsWith("live:"));

    const results = await Promise.all(
      liveKeys.map(async key => {
        const data = await getRedisValue(key);
        try {
          return JSON. parse(data);
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json({ data: results.filter(Boolean) });
    
    return NextResponse.json({ status: "success", data: dummyData });
  } catch (error) {
    console.error("[FATALER FEHLER] Fehler beim Redis-Zugriff:", error);
    return NextResponse.json(
      { status: "error", message: "Datenbankfehler" },
      { status: 500 }
    );
  }
}
