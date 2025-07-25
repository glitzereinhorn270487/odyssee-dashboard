// /app/api/initialize-bot/route.ts
import { NextResponse } from 'next/server';
import { initializeVirtualCapital } from '@/agent/trade-engine'; // Pfad anpassen

export async function GET() {
  try {
    await initializeVirtualCapital(1000); // Setze dein gewünschtes Startkapital
    return NextResponse.json({ success: true, message: "Virtuelles Kapital initialisiert." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}