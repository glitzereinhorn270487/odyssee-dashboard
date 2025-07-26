   // /app/api/bot-control/route.ts
import { NextResponse } from 'next/server';
import { setBotRunningStatus, getBotRunningStatus } from '@/lib/bot-status'; // Korrekter Import

export async function POST(req: Request) {
  try {
    const { action } = await req.json();
    console.log(`KI-Agent: Aktion empfangen: '${action}'`); 

    let statusToSet: boolean; // NEU: Variable für den zu setzenden Status

    if (action === 'start') {
      statusToSet = true; // Setze den gewünschten Status
      await setBotRunningStatus(statusToSet); // Verwende diesen Status
      console.log("KI-Agent: Start-Aktion verarbeitet."); 
    } else if (action === 'stop') {
      statusToSet = false; // Setze den gewünschten Status
      await setBotRunningStatus(statusToSet); // Verwende diesen Status
      console.log("KI-Agent: Stopp-Aktion verarbeitet."); 
    } else {
      console.warn(`KI-Agent: Ungültige Aktion empfangen: '${action}'`); 
      return NextResponse.json({ error: "Ungültige Aktion." }, { status: 400 });
    }

    // KORREKTUR: Gib den Status zurück, den wir gerade gesetzt haben,
    // anstatt ihn erneut aus Redis zu lesen, um Race Conditions zu vermeiden
    // oder die Konsistenz der Antwort zu gewährleisten.
    // Alternativ: newStatus = await getBotRunningStatus();
    // Aber für die direkte Antwort ist statusToSet besser.
    const finalStatus = statusToSet; // Verwende den Status, den wir gerade gesetzt haben
    
    console.log(`KI-Agent: Finaler Status nach Aktion: ${finalStatus ? 'ONLINE' : 'OFFLINE'}`); 
    return NextResponse.json({ success: true, running: finalStatus }); // Gib den finalen Status zurück
  } catch (error: any) {
    console.error("Fehler beim Steuern des Bots:", error);
    return NextResponse.json({ error: "Interner Fehler beim Steuern des Bots.", details: error.message }, { status: 500 });
  }
}
