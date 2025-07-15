// Datei: app/lib/policy-decision.ts

export const policyDecisionConfig = {
  "LetWinnersRun": {
    trailingStop: 0.68, // 68%
    initialSell: null,
    scaling: false,
  },
};
export const decidePolice = (tokenData: any) => {
  // Beispielhafte Logik (bitte später anpassen)
  if (tokenData.boosts?.includes("LetWinnersRun")) {
    return "Let-Winners-Run";
  }
  return "Default-Policy";
};
