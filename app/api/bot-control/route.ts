// /app/api/bot-control/route.ts
import { NextResponse } from 'next/server';
import { setBotRunningStatus, getBotRunningStatus } from '@/lib/bot-status'; 

export async function POST(req: Request) {
  console.log("[BotControlRoute] POST-Anfrage empfangen."); // NEUER LOG
  try {
    const { action } = await req.json();
    console.log(`[BotControlRoute] Aktion empfangen: '${action}'`); 

    let statusToSet: boolean; 

    if (action === 'start') {
      statusToSet = true; 
      await setBotRunningStatus(statusToSet); 
      console.log("[BotControlRoute] Start-Aktion verarbeitet."); 
    } else if (action === 'stop') {
      statusToSet = false; 
      await setBotRunningStatus(statusToSet); 
      console.log("[BotControlRoute] Stopp-Aktion verarbeitet."); 
    } else {
      console.warn(`[BotControlRoute] Ungültige Aktion empfangen: '${action}'`); 
      return NextResponse.json({ error: "Ungültige Aktion." }, { status: 400 });
    }

    const newStatus = await getBotRunningStatus(); 
    console.log(`[BotControlRoute] Finaler Status nach Aktion (aus getBotRunningStatus): ${newStatus ? 'ONLINE' : 'OFFLINE'}`); 
    return NextResponse.json({ success: true, running: newStatus }); 
  } catch (error: any) {
    console.error("[BotControlRoute] Fehler beim Steuern des Bots:", error);
    return NextResponse.json({ error: "Interner Fehler beim Steuern des Bots.", details: error.message }, { status: 500 });
  }
}
