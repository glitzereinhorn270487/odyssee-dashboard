// app/api/live-positions/route.js
import { createClient } from 'redis';
import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(request) {
  console.log("\n--- [START] API-Anfrage an /api/live-positions ---");

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.error("[FEHLER] REDIS_URL nicht in .env.local gefunden!");
    return NextResponse.json({ status: "error", message: "Server-Konfigurationsfehler" }, { status: 500 });
  }

  console.log("[INFO] REDIS_URL erfolgreich aus .env.local geladen.");
  
  let redis;
  try {
    console.log("[INFO] Versuche, Redis-Client zu erstellen...");
    redis = createClient({ url: redisUrl });
    console.log("[SUCCESS] Redis-Client erfolgreich erstellt.");

    redis.on('error', (err) => console.error('[REDIS FEHLER] Ein Client-Fehler ist aufgetreten:', err));

    console.log("[INFO] Versuche, Verbindung zu Redis aufzubauen...");
    await redis.connect();
    console.log("[SUCCESS] Verbindung zu Redis erfolgreich hergestellt.");

    // Für diesen Test lesen wir nur einen einfachen Wert aus, um die Verbindung zu beweisen.
    // In der echten DB schreiben wir später: await redis.set('test_key', 'Verbindung OK');
    const testValue = await redis.get('test_key');
    console.log(`[INFO] Test-Wert aus Redis gelesen: "${testValue}"`);
    
    // Test-Daten senden, um zu zeigen, dass die API funktioniert
    const dummyData = [{ tradeId: "test1", tokenSymbol: "TEST", initialInvestmentUsd: 100, currentValueUsd: 110, pnlPercentage: 10 }];

    await redis.quit();
    console.log("[INFO] Verbindung zu Redis sauber getrennt.");
    
    return NextResponse.json({ status: 'success', data: dummyData });

  } catch (error) {
    console.error("[FATALER FEHLER] Ein Fehler ist im try-Block aufgetreten:", error);
    if (redis && redis.isOpen) {
        await redis.quit();
    }
    return NextResponse.json({ status: 'error', message: 'Datenbank-Verbindungsfehler auf dem Server.' }, { status: 500 });
  }
}
