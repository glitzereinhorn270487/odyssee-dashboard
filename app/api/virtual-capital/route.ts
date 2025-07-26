// app/api/virtual-capital/route.ts

import { NextResponse } from 'next/server';
import { getVirtualCapital } from '@/agent/trade-engine' // Importiere die Funktion

export async function GET() {
  try {
    const capital = await getVirtualCapital();
    console.log(`[VirtualCapitalRoute] Virtuelles Kapital abgerufen: ${capital}$`); // Log
    return NextResponse.json({ capital });
  } catch (error: any) {
    console.error("Fehler beim Abrufen des virtuellen Kapitals:", error);
    return NextResponse.json({ error: "Interner Serverfehler", details: error.message }, { status: 500 });
  }
}
