// /app/api/bot-control/route.ts
import { NextResponse } from 'next/server';
import { setBotRunningStatus, getBotRunningStatus } from '@/lib/bot-status'; // Korrekter Import

export async function POST(req: Request) {
  try {
    const { action } = await req.json();

    if (action === 'start') {
      await setBotRunningStatus(true);
      console.log("KI-Agent gestartet.");
    } else if (action === 'stop') {
      await setBotRunningStatus(false);
      console.log("KI-Agent gestoppt.");
    } else {
      return NextResponse.json({ error: "Ungültige Aktion." }, { status: 400 });
    }

    const newStatus = await getBotRunningStatus();
    return NextResponse.json({ success: true, running: newStatus });
  } catch (error: any) {
    console.error("Fehler beim Steuern des Bots:", error);
    return NextResponse.json({ error: "Interner Serverfehler", details: error.message }, { status: 500 });
  }
}
