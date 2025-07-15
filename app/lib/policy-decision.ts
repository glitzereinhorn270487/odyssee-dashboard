// Datei: app/lib/policy-decision.ts

export const policyDecisionConfig = {
  "LetWinnersRun": {
    trailingStop: 0.68, // 68%
    initialSell: null,
    scaling: false,
  },
};
export const decidePolice = (
  category: string,
  numericScore: number,
  boost: string[]
): string => {
  // Beispielhafte, einfache Logik zur Zuordnung
  if (boost.includes("LetWinnersRun")) return "Let-Winners-Run";
  if (category === "Insider" && numericScore > 90) return "Insider-Highscore";
  return "Default-Policy";
};

