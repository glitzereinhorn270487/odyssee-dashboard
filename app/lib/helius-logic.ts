export async function fetchFromHelius(walletAddress: string){
  const API_KEY = process.env.HELIUS_API_KEY;
  const limit = 15;

const url = 'https://api.helius.xyz/v0/token-metadata?api-key=1fa0561c-8411-49f1-ae76-f49a1f2c8d798d79'
  try {
    const response = await fetch(url);
    const pools = await response.json();

    // Konvertiere die Daten in das erwartete Format
    const tokens = pools.map((pool: any) => ({
      symbol: pool.symbol ?? "UNKNOWN",
      address: pool.address,
      category: "unclassified", // später durch Analyse ersetzt
      score: 0 // später durch Analyse ersetzt
    }));

    return tokens;
  } catch (error) {
    console.error("[HELIUS] API Error:", error);
    return [];
  }
}
export const fetchRecentTransactions = async (address: string) => {
  // Placeholder – implementieren oder entfernen je nach Verwendung
  return [];
};

