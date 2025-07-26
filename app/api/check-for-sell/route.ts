// app/api/check-for-sell/route.ts

import { NextResponse } from 'next/server';
import { checkForSell } from '../../agent/trade-engine'; 
import { getBotRunningStatus } from '@/lib/bot-status'; // Importiere getBotRunningStatus

export async function GET() {
  const botRunning = await getBotRunningStatus();
  console.log(`[CHECK-FOR-SELL] Beim Start: Bot Running Status: ${botRunning ? 'ONLINE' : 'OFFLINE'}`); // NEUER LOG

  if (!botRunning) {
    console.log("[CHECK-FOR-SELL] Bot ist gestoppt. Überspringe Verkaufsprozess.");
    return NextResponse.json({ success: false, message: "Bot ist gestoppt." }, { status: 200 });
  }

  try {
    await checkForSell();
    return NextResponse.json({ success: true, message: "Verkaufsscheck abgeschlossen." });
  } catch (error: any) {
    console.error("Cronjob 'check-for-sell' Fehler:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
