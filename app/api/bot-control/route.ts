    // /app/api/bot-control/route.ts
    import { NextResponse } from 'next/server';
    import { setBotRunningStatus, getBotRunningStatus } from '@/lib/bot-status'; // Korrekter Import

    export async function POST(req: Request) {
      try {
        const { action } = await req.json();
        console.log(`KI-Agent: Aktion empfangen: '${action}'`); // NEUER DEBUG-LOG

        if (action === 'start') {
          await setBotRunningStatus(true);
          console.log("KI-Agent: Start-Aktion verarbeitet."); // Debug-Log
        } else if (action === 'stop') {
          await setBotRunningStatus(false);
          console.log("KI-Agent: Stopp-Aktion verarbeitet."); // Debug-Log
        } else {
          console.warn(`KI-Agent: Ungültige Aktion empfangen: '${action}'`); // Debug-Log
          return NextResponse.json({ error: "Ungültige Aktion." }, { status: 400 });
        }

        const newStatus = await getBotRunningStatus(); // Holt den NEUEN Status aus Redis
        console.log(`KI-Agent: Finaler Status nach Aktion: ${newStatus ? 'ONLINE' : 'OFFLINE'}`); // Debug-Log
        return NextResponse.json({ success: true, running: newStatus }); // Gibt den NEUEN Status zurück
      } catch (error: any) {
        console.error("Fehler beim Steuern des Bots:", error);
        return NextResponse.json({ error: "Interner Fehler beim Steuern des Bots.", details: error.message }, { status: 500 });
      }
    }
    