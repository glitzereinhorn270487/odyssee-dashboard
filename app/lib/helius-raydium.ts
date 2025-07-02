export async function fetchNewRaydiumPools(): Promise<any[]> {
  try {
    const response = await fetch("https://metis-api.solana.pink/new-pools");
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.warn("[HELIUS/METIS] Unerwartetes Datenformat:", data);
      return [];
    }

    return data.map((entry) => ({
      symbol: entry.symbol ?? "UNBEKANNT",
      address: entry.address,
      category: "unclassified",
      score: 0,
    }));
  } catch (error) {
    console.error("[HELIUS/METIS] Fehler beim Pool-Fetch:", error);
    return [];
  }
}