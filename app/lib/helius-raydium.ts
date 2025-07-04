// app/lib/helius-raydium.ts
const HELIUS_API_KEY = process.env.HELIUS_API_KEY!;
const HELIUS_URL = `https://api.helius.xyz/v0/addresses{WalletAddress}/transactions/?api-key=1fa0561c-8411-49f1-ae76-f49a1f2c8d79`;

interface RaydiumPool {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  poolAddress: string;
  timestamp: number;
}

export async function fetchNewRaydiumPools(): Promise<RaydiumPool[]> {
  const now = Math.floor(Date.now() / 1000);
  const tenMinutesAgo = now - 600;

  const body = {
    accountType: "TOKEN_SWAP",
    before: 0,
    limit: 20,
    displayOptions: {
      showHumanReadableTypes: true,
      showMetadata: true,
    },
    sortDirection: "DESCENDING",
    commitment: "finalized",
    timestamp: {
      from: tenMinutesAgo,
      to: now,
    },
  };

  const response = await fetch(`${HELIUS_URL}/v0/addresses/activity`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Helius API Error: ${response.status}`);
  }

  const json = await response.json();

  const pools = json
    .filter((entry: any) => entry.type === "SWAP" && entry.tokenTransfers?.length >= 2)
    .map((entry: any) => {
      const token = entry.tokenTransfers[1]; // meistens das "gekaufte" Token
      return {
        tokenAddress: token.mint,
        tokenSymbol: token.symbol || "UNKNOWN",
        tokenName: token.tokenName || "Unbenannt",
        poolAddress: entry.signature,
        timestamp: entry.timestamp,
      };
    });

  return pools;
}
