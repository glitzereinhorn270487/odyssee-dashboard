// app/lib/price-manager.ts

export async function getCurrentPrice(tokenAddress: string): Promise<number> {
  try {
    const response = await fetch(`https://public-api.birdeye.so/public/price?address=${tokenAddress}`, {
      headers: {
        "X-API-KEY": process.env.BIRDEYE_API_KEY!,
      },
    });

    const json = await response.json();
    return json.data.value || 0;
  } catch (error) {
    console.error("Fehler beim Abrufen des Preises:", error);
    return 0;
  }
}