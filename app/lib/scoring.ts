export async function getScoreX(tokenAddress: string): Promise<number> {
  // Dummy-Implementierung – später durch echte On-Chain/Social-Analyse ersetzen
  return 85;
}

export function getBoostFactors(token: any): {
  buzz: number;
  whale: number;
  meme: number;
  kyc: number;
} {
  return {
    buzz: 0.2,
    whale: 0.1,
    meme: 0.3,
    kyc: 0.0
  };
}
