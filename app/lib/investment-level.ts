// 🔁 investment-level.ts (lib/investment-level.ts)

export const investLevelArray = ["M0", "M1", "M2", "M3", "M4", "M5"];

export const investmentLevels: Record<string, { level: string; minCapital: number; maxCapital: number; minScore: number; maxRisk: number }> = {
  M0: { level: "M0", minCapital: 75, maxCapital: 149, minScore: 65, maxRisk: 35 },
  M1: { level: "M1", minCapital: 150, maxCapital: 299, minScore: 68, maxRisk: 32 },
  M2: { level: "M2", minCapital: 300, maxCapital: 599, minScore: 70, maxRisk: 28 },
  M3: { level: "M3", minCapital: 600, maxCapital: 1199, minScore: 73, maxRisk: 25 },
  M4: { level: "M4", minCapital: 1200, maxCapital: 2399, minScore: 75, maxRisk: 20 },
  M5: { level: "M5", minCapital: 2400, maxCapital: Infinity, minScore: 77, maxRisk: 17 },
};

export function getInvestmentLevel(capital: number): string {
  for (const key in investmentLevels) {
    const level = investmentLevels[key];
    if (capital >= level.minCapital && capital <= level.maxCapital) {
      return key;
    }
  }
  return "M0";
}