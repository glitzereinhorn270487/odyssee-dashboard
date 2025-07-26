// app/api/bot-status/route.ts

import { NextResponse } from 'next/server';
import { getBotRunningStatus } from '@/lib/bot-status'; // Korrekter Import

export async function GET() {
  try {
    const running = await getBotRunningStatus();
    return NextResponse.json({ running });
  } catch (error: any) {
    console.error("Fehler beim Abrufen des Bot-Status:", error);
    return NextResponse.json({ error: "Interner Serverfehler", details: error.message }, { status: 500 });
  }
}
