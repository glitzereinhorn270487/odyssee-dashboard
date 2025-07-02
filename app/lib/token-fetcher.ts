// app/lib/token-fetcher.ts
export async function fetchRecentRaydiumTokens(): Promise<any[]> {
  try {
    const response = await fetch("https://client-api.metis.market/pools/new");
    const json = await response.json();

    const pools = json.pools ?? [];
    const tokens = pools.map((pool: any) => ({
      symbol: pool.baseTokenSymbol ?? "UNKNOWN",
      address: pool.baseTokenAddress,
      category: "unclassified", // wird später vom Agenten analysiert
      score: 0 // wird später berechnet
    }));

    return tokens;
  } catch (error) {
    console.error("[TOKEN-FETCHER] Fehler beim Abruf von Metis:", error);
    return [];
  }
}