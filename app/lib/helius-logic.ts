export async function fetchNewPools(): Promise<any[]> {
  return []; // Platzhalter
}

export async function analyseToken(pool: any): Promise<any> {
  return {
    name: "DummyToken",
    score: 100,
    isInsider: false,
    isSmartMoney: false,
    isViralX: false,
    isNarrativeMaker: false,
    isRedFlag: false
  };
}
