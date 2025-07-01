// File: app/lib/scoring.ts

export function getTokenScore(token: any): number {
  // Dummy-Logik – kann später mit echter Metrik ersetzt werden
  return Math.floor(Math.random() * 100);
}

export function getRiskLevel(token: any): number {
  return token.riskScore || 0;
}

export function getBoostScore(token: any): number {
  return token.boostScore || 0;
}

export async function getScoreX(address: string): Promise<number> {
  // Simuliere eine komplexere Berechnung – später mit Realwerten
  return Math.floor(Math.random() * 100);
}

export function getBoostFactors(token: any): { buzz: number; whale: number; meme: number; kyc: number } {
  return {
    buzz: token.buzzScore || 0,
    whale: token.whaleScore || 0,
    meme: token.memeScore || 0,
    kyc: token.kycScore || 0
  };
}

