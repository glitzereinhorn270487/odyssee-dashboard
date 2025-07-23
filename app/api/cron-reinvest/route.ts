import { NextResponse } from "next/server";
import { checkAndReinvest } from "@/lib/reinvest-loop";

export async function GET() {
  try {
    // KORREKTUR: Die Funktion wird ohne Argumente aufgerufen
    await checkAndReinvest(); 
    
    return NextResponse.json({ success: true, message: "Reinvest-Prüfung erfolgreich." });
  } catch (err: any) {
    console.error("Reinvest Cronjob Fehler:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}