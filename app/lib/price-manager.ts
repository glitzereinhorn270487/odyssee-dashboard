export async function getLivePrice(tokenAddress: string): Promise<number> {
  return 0.001; // Platzhalter
}

export function checkSellRules(token: any, currentPrice: number): { shouldSell: boolean; reason: string } {
  return { shouldSell: false, reason: "Dummy" };
}
