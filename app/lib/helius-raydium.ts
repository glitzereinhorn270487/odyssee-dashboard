// app/lib/helius-raydium.ts

export async function fetchNewRaydiumPools(): Promise<
  { symbol: string; address: string; category: string; score: number }[]
> {
  try {
    const res = await fetch("https://api.metis.solana.pink/api/new-pools");
    try {
  const response = await fetch(...);
  // weiter wie gehabt
} catch (error) {
  console.error("[HELIUS/METIS] Fehler beim Pool-Fetch:", error);
  return []; // leere Liste zurückgeben, um Agent am Leben zu halten
}
    const data = await res.json();

    const mapped = data.map((item: any) => ({
      symbol: item.baseTokenSymbol ?? "UNKNOWN",
      address: item.baseTokenAddress,
      category: "unclassified",
      score: 0,
    }));

    return mapped;
  } catch (err) {
    console.error("[HELIUS/METIS] Fehler beim Pool-Fetch:", err);
    return [];
  }
}

