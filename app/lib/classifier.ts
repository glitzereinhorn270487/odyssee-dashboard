// app/lib/classifier.ts

export function classifyToken(tokenData: any): string {
  const { scoreX, boostScore, categoryHints } = tokenData;

  if (categoryHints?.includes("Insider")) return "Insider Follow-Trade";
  if (boostScore > 85 && scoreX > 90) return "Top Moonshot";
  if (boostScore > 70) return "Buzz Candidate";
  if (tokenData.source === "whale") return "Whale Watch";
  return "Unclassified";
}