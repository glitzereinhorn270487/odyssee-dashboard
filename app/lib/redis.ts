// lib/redis.ts

const REST_URL = process.env.UPSTASH_REDIS_REST_URL!;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

if (!REST_URL || !REST_TOKEN) {
  throw new Error("❌ Redis-Konfigurationswerte fehlen in der .env-Datei!");
}


export async function getMonitoredWallets() {
  const raw = await getRedisValue("monitored_wallets");
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
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
  const safeValue = typeof value === "string" ? value : JSON.stringify(value);

  try {
    await fetch(`${REST_URL}/set/${key}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value: safeValue }),
    });
  } catch (error) {
    console.error("[REDIS-SET FEHLER]", error);
  }
}


export async function removeWalletFromDB(address: string, cluster: string) {}

export interface WalletData {
  alphaScore: number;
  winRate: number;
  note: string;
}

export async function addWalletToDB(address: string, data: string) {
  await setRedisValue(`smartmoney:${address}`, data); // oder "insider:${address}", etc.
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

export async function isTokenAlreadyTracked(tokenAddress: string): Promise<boolean> {
  const result = await getRedisValue(`live:${tokenAddress}`);
  return !!result;
}

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
