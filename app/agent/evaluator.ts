// File: app/agent/evaluator.ts

import { getSocialBuzz, getSmartMoneyTags, getTelegramGroupPresence } from "@/lib/social-intel";
import { getScoreX, getBoostFactors } from "@/lib/scoring";
import { investmentLevels } from "@/lib/investment-level"; // ✅ Beachte: nicht "app/lib/...", sondern "@/lib/..."

const wallets = [
  { name: "Main", address: "G4WaYDoB8huCBmWJ7roVK9q5p4N1LUET4rYpwCPmfPVs", currentLevel: "M1" },
];

for (const wallet of wallets) {
  // 🔧 Dummy für Kapitalberechnung – später durch echten Wert ersetzen
  const freeCapital = Math.floor(Math.random() * 3000);

  // 🔍 Neue Investmentstufe berechnen
  let newLevel = "NONE";
  for (const level in investmentLevels) {
    const config = investmentLevels[level];
    if (freeCapital >= config.minCapital && freeCapital <= config.maxCapital) {
      newLevel = level;
      break;
    }
  }

  // 💡 Nur wenn sich die Stufe geändert hat, loggen oder speichern
  if (wallet.currentLevel !== newLevel) {
    console.log(`📈 ${wallet.name}: ${wallet.currentLevel} → ${newLevel}`);
    wallet.currentLevel = newLevel;

    // Optional: Speichern in Redis oder Datei
    // await setRedisValue(`wallet:${wallet.address}:level`, newLevel);
  }
}

// ✅ Token-Evaluator – bleibt wie gehabt
export async function evaluateToken(token: any) {
  const scoreX = await getScoreX(token.address);
  const socialBuzz = await getSocialBuzz(token.address);
  const smartMoney = await getSmartMoneyTags(token.address);
  const telegram = await getTelegramGroupPresence(token.address);

  return {
    scoreX,
    socialBuzz,
    smartMoney,
    telegram,
    boostFactors: await getBoostFactors(token),
  };
}
