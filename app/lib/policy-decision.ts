// Datei: app/lib/policy-decision.ts

export function decidePolice(numericScore: number, risk: number, boost: number): string {
  if (numericScore > 85 && boost > 30 && risk < 20) {
    return "Hybrid-Moonshot";
  } else if (numericScore > 70 && risk < 35) {
    return "Momentum Ride";
  } else if (numericScore > 50 && boost > 15) {
    return "Quick-Scalp";
  } else {
    return "Stagnations-Detektor";
  }
}
