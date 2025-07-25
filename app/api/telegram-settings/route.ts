// /app/api/telegram-settings/route.ts
import { NextResponse } from 'next/server';
import { getTelegramToggles, setTelegramToggles, TelegramToggles } from '@/config/telegramToggles';

// GET-Anfrage: Holt die aktuellen Telegram-Einstellungen
export async function GET() {
  try {
    const toggles = await getTelegramToggles();
    return NextResponse.json(toggles);
  } catch (error: any) {
    console.error("Fehler beim Abrufen der Telegram-Einstellungen:", error);
    return NextResponse.json({ error: "Interner Serverfehler", details: error.message }, { status: 500 });
  }
}

// POST-Anfrage: Aktualisiert die Telegram-Einstellungen
export async function POST(req: Request) {
  try {
    const newToggles: TelegramToggles = await req.json();
    await setTelegramToggles(newToggles);
    return NextResponse.json({ success: true, message: "Telegram-Einstellungen aktualisiert." });
  } catch (error: any) {
    console.error("Fehler beim Aktualisieren der Telegram-Einstellungen:", error);
    return NextResponse.json({ error: "Interner Serverfehler", details: error.message }, { status: 500 });
  }
}