// File: app/lib/scoring.ts

// Beispiel: scoring.ts
type TokenScore = {
  baseScore: number;
  totalScore: number;
  fomoScore: number;
  scoreX: number;
  pumpRisk: string;
  flags: string[];
};

export async function getTokenScore(token: any) {
  let scoreX = 0; // Initialisiere scoreX am Anfang der Funktion
  
  // KORREKTUR: Hole den fomoScore aus dem übergebenen token-Objekt
  const fomoScore = token.fomoScore; 

  if (fomoScore === 'hoch') {
    scoreX += 12;
  } else if (fomoScore === 'mittel') {
    scoreX += 6;
  }
  
  // ... hier folgen deine weiteren Berechnungen für scoreX ...

  return scoreX;

    
  };

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

