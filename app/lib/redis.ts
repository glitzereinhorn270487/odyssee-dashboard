import type { RedFlagWallet } from "@/types/RedFlagWallet";
import type { InsiderWallet} from "@/types/InsiderWallet";
import type {SmartMoneyWallet} from "@/types/SmartMoneyWallet";
import type {ViralXAccount} from "@/types/ViralXAccount";
import type {NarrativeMaker} from "@/types/NarrativeMaker";

const result = await getRedisValue<RedFlagWallet>("wallets:redflag:5r1mS4g...");

if (result?.isBlacklisted) {
  console.log("Dieser Wallet ist geblacklistet:", result.note);
}
const REST_URL = process.env.UPSTASH_REDIS_REST_URL!;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

if (!REST_URL || !REST_TOKEN) {
  throw new Error("❌ Redis-Konfigurationswerte fehlen in der .env-Datei!");
}

export async function getRedisValue<T = any>(key: string): Promise<T | null> {
  try {
    const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.result ? JSON.parse(data.result) : null;
  } catch (error) {
    console.error("[REDIS ERROR]", error);
    return null;
  }
}

export async function setRedisValue<T = any>(key: string, value: T): Promise<void> {
  try {
    await fetch(`${REST_URL}/set/${key}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value: JSON.stringify(value),
      }),
    });
  } catch (error) {
    console.error("[REDIS-SET FEHLER]", error);
  }
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

export async function isTokenAlreadyTracked(tokenAddress: string): Promise<boolean> {
  const result = await getRedisValue(`live:${tokenAddress}`);
  return !!result;
}

export async function trackTokenInRedis(tokenAddress: string, data: any): Promise<void> {
  await setRedisValue(`live:${tokenAddress}`, data);
}

export async function getMonitoredWallets() {
  const raw = await getRedisValue("monitored_wallets");
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

export async function addWalletToDB(address: string, data: string) {
  await setRedisValue(`smartmoney:${address}`, data); // oder "insider:${address}" etc.
}

export async function removeWalletFromDB(address: string, cluster: string) {
  // Optional: z. B. setze leeren Wert oder delete key
  await delRedisKey(`${cluster}:${address}`);
}
