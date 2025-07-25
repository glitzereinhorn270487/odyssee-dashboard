// app/api/check-for-sell/route.ts
import { NextResponse } from 'next/server';
// KORREKTUR: Der relative Pfad ist '../../agent/trade-engine'
import { checkForSell } from '../../agent/trade-engine'; 

export async function GET() {
  try {
    // Ruft die checkForSell-Funktion auf, die alle offenen Positionen prüft
    await checkForSell();
    return NextResponse.json({ success: true, message: "Verkaufsscheck abgeschlossen." });
  } catch (error: any) {
    console.error("Cronjob 'check-for-sell' Fehler:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
