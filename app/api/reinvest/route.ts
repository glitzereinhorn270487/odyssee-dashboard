import { NextResponse } from "next/server";
import { checkAndReinvest } from "@/lib/reinvest-loop";

// Definiere die zu überprüfende Wallet-Adresse hier
// In Zukunft könnte diese Adresse aus einer Datenbank oder Konfigurationsdatei kommen
const WALLET_TO_CHECK = "G4WaYDoB8huCBmWJ7roVK9q5p4N1LUET4rYpwCPmfPVs"; 

export async function GET() {
  try {
    // Übergebe die definierte Variable an die Funktion
    await checkAndReinvest();
    
    return NextResponse.json({ success: true, message: "Reinvest-Prüfung erfolgreich." });
  } catch (err: any) { // Es ist eine gute Praxis, den Fehler als 'any' zu typisieren
    console.error("Reinvest Cronjob Fehler:", err);
    // Gib nur die Fehlermeldung zurück, nicht das ganze Fehlerobjekt
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}