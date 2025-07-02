export async function fetchRecentRaydiumTokens(): Promise<any[]> {
  const API_KEY = process.env.HELIUS_API_KEY;
  const url = `wss://mainnet.helius-rpc.com/?api-key=1fa0561c-8411-49f1-ae76-f49a1f2c8d79`;
  const limit = 15;

  // 👇 Beispiel-URL musst du durch echten Raydium-/Helius-Endpunkt ersetzen!
  const response = await fetch(`wss//mainnet.helius-rpc.com/?api-key=1fa0561c-8411-49f1-ae76-f49a1f2c8d79`);
  const pools = await response.json();

  // Konvertiere die Daten in das erwartete Format
  const tokens = pools.map((pool: any) => ({
    symbol: pool.baseTokenSymbol ?? "UNKNOWN",
    address: pool.baseTokenAddress,
    category: "unclassified", // später durch Analyse ersetzt
    score: 0 // später durch Analyse ersetzt
  }));

  return tokens;
} catch (error) {
  console.error("[HELIUS] API Error:", error);
  return [];
}
}