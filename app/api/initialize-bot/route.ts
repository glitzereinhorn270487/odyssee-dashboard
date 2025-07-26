// app/api/initialize-bot/route.ts

import { NextResponse } from 'next/server';
import { initializeVirtualCapital } from 'app/agent/trade-engine'; // Korrekter Pfad zur Funktion

export async function GET() {
  try {
    await initializeVirtualCapital(1000); // Setze dein gewünschtes Startkapital hier
    return NextResponse.json({ success: true, message: "Virtuelles Kapital initialisiert." });
  } catch (error: any) {
    console.error("Fehler beim Initialisieren des Bots:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
