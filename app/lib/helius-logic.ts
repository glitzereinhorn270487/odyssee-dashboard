// app/lib/helius-logic.ts

export async function getNewLiquidityPoolsSince(lastTimestamp: number): Promise<any[]> {
  const now = Date.now();
  const url = `https://api.helius.xyz/v0/addresses/active/liquidity-pools?since=${lastTimestamp}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${process.env.HELIUS_API_KEY!}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Helius API Fehler:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data.pools || [];
  } catch (error) {
    console.error("Fehler beim Abrufen von Helius-Daten:", error);
    return [];
  }
}
