// app/api/initialize-bot/route.ts

import { NextResponse } from 'next/server';
import { initializeVirtualCapital } from '@/agent/trade-engine'; // Korrekter Pfad zur Funktion

export async function GET() {
  try {
    // Ruft die initializeVirtualCapital-Funktion auf, um das Startkapital zu setzen
    // Du kannst den initialAmount hier anpassen, z.B. 5000 für 5000 USD Startkapital
    await initializeVirtualCapital(1000); 
    
    return NextResponse.json({ success: true, message: "Virtuelles Kapital initialisiert." });
  } catch (error: any) {
    console.error("Fehler beim Initialisieren des Bots:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
