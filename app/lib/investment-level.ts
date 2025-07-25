// 🔁 investment-level.ts (lib/investment-level.ts)

export const investLevelArray = ["M0", "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10"];

export const investmentLevels: Record<string, {
  level: string;
  minCapital: number;    // Das Gesamtkapital des Agenten
  maxCapital: number;
  maxInvestment: number; // Der maximale Einsatz für einen EINZELNEN Trade in dieser Stufe
  minScore: number;      // Die erforderliche Mindest-Signalstärke (ScoreX)
  minLiquidity?: number; // Die erforderliche Mindest-Liquidität im Pool (für hohe Stufen)
}> = {
  // --- Standard-Stufen ---
  M0: { level: "M0", minCapital: 75,     maxCapital: 149,     maxInvestment: 25,    minScore: 65 },
  M1: { level: "M1", minCapital: 150,    maxCapital: 299,     maxInvestment: 50,    minScore: 68 },
  M2: { level: "M2", minCapital: 300,    maxCapital: 599,     maxInvestment: 100,   minScore: 70 },
  M3: { level: "M3", minCapital: 600,    maxCapital: 1199,    maxInvestment: 200,   minScore: 73 },
  M4: { level: "M4", minCapital: 1200,   maxCapital: 2399,    maxInvestment: 400,   minScore: 75 },
  M5: { level: "M5", minCapital: 2400,   maxCapital: 4999,    maxInvestment: 800,   minScore: 77 },
  
  // --- Erweiterte Profi-Stufen ---
  M6: { level: "M6", minCapital: 5000,   maxCapital: 9999,    maxInvestment: 1500,  minScore: 80 },
  M7: { level: "M7", minCapital: 10000,  maxCapital: 19999,   maxInvestment: 3000,  minScore: 82 },
  M8: { level: "M8", minCapital: 20000,  maxCapital: 49999,   maxInvestment: 6000,  minScore: 85, minLiquidity: 60000 },
  
  // --- Whale-Modus (erfordert Mindest-Liquidität) ---
  M9: { level: "M9", minCapital: 50000,  maxCapital: 99999,   maxInvestment: 12000, minScore: 88, minLiquidity: 120000 },
  M10: { level: "M10", minCapital: 100000, maxCapital: Infinity,  maxInvestment: 25000, minScore: 92, minLiquidity: 250000 },
};

/**
 * Ermittelt die korrekte Investment-Stufe basierend auf dem Gesamtkapital.
 * @param capital Das Gesamtkapital des Agenten.
 * @returns Die zutreffende Investment-Stufe als String (z.B. "M8").
 */
export function getInvestmentLevel(capital: number): string {
  // Wir durchsuchen das Array rückwärts, um die höchste passende Stufe zuerst zu finden.
  for (const levelKey of [...investLevelArray].reverse()) {
    const level = investmentLevels[levelKey];
    if (capital >= level.minCapital) {
      return levelKey;
    }
  }
  
  // Fallback für Kapital, das unter der niedrigsten Stufe liegt.
  return "NONE";
}