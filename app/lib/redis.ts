// lib/redis.ts – Upstash REST-kompatibel

const REST_URL = process.env.UPSTASH_REDIS_REST_URL!;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

if (!REST_URL || !REST_TOKEN) {
  throw new Error("❌ Redis-Konfigurationswerte fehlen in der .env-Datei!");
}

export async function getRedisValue(key: string): Promise<any | null> {
  try {
    const response = await fetch(`${REST_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${REST_TOKEN}` },
    });
    const data = await response.json();
    return data.result ?? null;
  } catch (error) {
    console.error("[REDIS-GET FEHLER]", error);
    return null;
  }
}

export async function setRedisValue(key: string, value: any): Promise<void> {
  try {
    await fetch(`${REST_URL}/set/${key}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value }),
    });
  } catch (error) {
    console.error("[REDIS-SET FEHLER]", error);
  }
}
export async function getMonitoredWallets() {
  return [
    { address: "abc123...", cluster: "SmartMoney" },
    { address: "def456...", cluster: "Insider" },
  ];
}
export async function removeWalletFromDB(address: string, cluster: string) { }

export interface WalletData {
  alphaScore: number;
  winRate: number;
  note: string;
}

export async function addWalletToDB(address: string, data: WalletData) {
await setRedisValue(`wallet:${address}`, JSON.stringify(data));

}

export async function delRedisKey(key: string): Promise<void> {
  try {
    await fetch(`${REST_URL}/del/${key}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${REST_TOKEN}` },
    });
  } catch (error) {
    console.error("[REDIS-DEL FEHLER]", error);
  }
}

// Prüft, ob ein Token bereits in Redis gespeichert ist
export async function isTokenAlreadyTracked(tokenAddress: string): Promise<boolean> {
  const result = await getRedisValue(`live:${tokenAddress}`);
  return !!result;
}

// Speichert das Token-Objekt unter seinem Schlüssel
export async function trackTokenInRedis(tokenAddress: string, data: any): Promise<void> {
  await setRedisValue(`live:${tokenAddress}`, data);
}

export async function getAllKeys(): Promise<string[]> {
  try {
    const response = await fetch(`${REST_URL}/keys/*`, {
      headers: { Authorization: `Bearer ${REST_TOKEN}` },
    });
    const data = await response.json();
    return data.result ?? [];
  } catch (error) {
    console.error("[REDIS-KEYS FEHLER]", error);
    return [];
  }
}
