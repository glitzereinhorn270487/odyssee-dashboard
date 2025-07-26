// app/api/performance-stats/route.ts

import { NextResponse } from 'next/server';
// Normalerweise würden wir hier redis importieren und echte Daten abrufen
// import redis from '@/lib/redisClient';

export async function GET() {
  try {
    // --- ACHTUNG: Dies sind simulierte Daten für den Paper Trade! ---
    // Später werden diese Werte aus Redis/Trade-Logs gelesen.
    const totalTrades = Math.floor(Math.random() * 100) + 20; // Zwischen 20 und 119 Trades
    // Eine realistischere Win Rate zwischen 40% und 85%
    const winRate = parseFloat((Math.random() * (0.85 - 0.40) + 0.40).toFixed(2)) * 100;

    return NextResponse.json({ totalTrades, winRate });
  } catch (error: any) {
    console.error("Fehler beim Abrufen der Performance-Statistiken:", error);
    return NextResponse.json({ error: "Interner Serverfehler", details: error.message }, { status: 500 });
  }
}
