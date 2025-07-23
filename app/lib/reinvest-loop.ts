import redis from "@/lib/redisClient";
import { investmentLevels, investLevelArray } from "@/lib/investment-level";
// Empfehlung: Eine generischere Funktion für System-Nachrichten erstellen
import { sendTelegramBuyMessage } from "@/lib/telegram"; 

// Die Wallet-Adressen sollten idealerweise aus einer zentralen Konfiguration oder Datenbank kommen.
const WALLET_ADDRESSES = [
  "G4WaYDoB8huCBmWJ7roVK9q5p4N1LUET4rYpwCPmfPVs",
  "4BNq8DTq3NEeghACPQr2eNP2SB6GwM7jfrDCz3F3S",
  "D5TVMDJx9eH7S3Zoag7ztpyLuhVrdc3vALNYGbtGo2LT",
  "2Yik4m7tHezYdAtzWsHc2yA4CxuD2uygWMvN9mkuwum2",
  "5FyWKkkHofe63VWg7jS7R4Q3T5cRgxE7ET8LVqF1Z3",
  "5ip4WzbMoG6Yk5dMmkvLQqLu8G5CkSnyam6ry37ARhyd"
];

// KORREKTUR: Der ungenutzte Parameter wurde entfernt.
export async function checkAndReinvest() {
  // OPTIMIERUNG: Nutze redis.mget für eine einzige, schnellere Anfrage für alle Wallets.
  const capitalKeys = WALLET_ADDRESSES.map(address => `wallet:${address}:capital`);
  const capitalStrings = await redis.mget(capitalKeys);

  // Kapital aller Wallets sicher summieren
  const totalCapital = capitalStrings.reduce((sum, capitalStr) => {
    const capital = capitalStr ? parseFloat(capitalStr) : 0;
    return sum + capital;
  }, 0);

  // Aktuelle globale Stufe holen
  const currentLevel = await redis.get("wallet:global:level") || "NONE";

  // KORREKTUR: Passende neue Stufe effizient und korrekt bestimmen.
  // Wir durchsuchen das Array rückwärts, um sicherzustellen, dass wir die höchste passende Stufe finden.
  let newLevel = "NONE";
  for (const lvl of [...investLevelArray].reverse()) {
    const stufe = investmentLevels[lvl];
    if (totalCapital >= stufe.minCapital) {
      newLevel = lvl;
      break; // WICHTIG: Die Schleife wird beendet, sobald die erste (und damit höchste) Stufe gefunden wurde.
    }
  }

  if (newLevel !== currentLevel) {
    await redis.set("wallet:global:level", newLevel);

    // KORREKTUR: Wir nutzen die existierende "sendTelegramBuyMessage"-Funktion.
    // Wir formatieren die Daten so, dass sie als System-Nachricht erkennbar sind.
    await sendTelegramBuyMessage({
      address: "System-Update", // Eindeutiger Bezeichner
      symbol: `📊 Neue Stufe: ${newLevel}`, // Klare Botschaft im "Symbol"-Feld
      scoreX: 100, // Hoher Score, um Wichtigkeit zu signalisieren
      fomoScore: `Kapital: ${totalCapital.toLocaleString('de-DE', { style: 'currency', currency: 'USD' })}`, // Nutzen das Feld für Zusatzinfos
      pumpRisk: "N/A", // Nicht relevant für diese Art von Nachricht
    });

    console.log(`ℹ️ Neue Reinvest-Stufe gesetzt: ${newLevel} bei einem Kapital von ${totalCapital}`);
    return { levelChanged: true, newLevel: newLevel };
} else {
    console.log(`✅ Reinvest-Stufe unverändert: ${newLevel} bei einem Kapital von ${totalCapital}`);
    return { levelChanged: false, newLevel: newLevel };
}
}
