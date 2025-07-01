// File: app/lib/scoring.ts

export function getTokenScore(token: any): number {
  // Beispielhafte Bewertungslogik – bitte durch reale ersetzen
  return Math.floor(Math.random() * 100); // z. B. Score von 0 bis 100
}

export function getRiskLevel(token: any): number {
  return token.riskScore || 0;
}

export function getBoostScore(token: any): number {
  return token.boostScore || 0;
}
