// /lib/redis.ts
// Diese Datei enthält Helper-Funktionen, die den Redis-Client aus redisClient.ts nutzen
import redis from './redisClient'; // Importiert den *fertigen* Redis-Client

/**
 * Ruft einen Wert aus Redis ab und parst ihn als JSON, falls möglich.
 * @param key Der Schlüssel, dessen Wert abgerufen werden soll.
 * @returns Der geparste Wert oder null, wenn der Schlüssel nicht existiert oder ein Parsing-Fehler auftritt.
 */
export async function getRedisValue<T>(key: string): Promise<T | null> {
  const value = await redis.get(key) as string | null; // Upstash Redis gibt string oder null zurück
  if (value === null) return null;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`[Redis Helper] Fehler beim Parsen von JSON für Key "${key}":`, error);
    return null; // Rückgabe null bei Parsing-Fehler
  }
}

/**
 * Speichert einen Wert in Redis und serialisiert ihn als JSON.
 * @param key Der Schlüssel, unter dem der Wert gespeichert werden soll.
 * @param value Der zu speichernde Wert.
 */
export async function setRedisValue<T>(key: string, value: T): Promise<void> {
  // Upstash Redis erwartet direkt den Wert (Objekt/Array wird automatisch serialisiert)
  await redis.set(key, value); 
}

/**
 * Ruft alle Schlüssel ab, die einem Muster entsprechen.
 * ACHTUNG: `keys()` kann in großen Datenbanken langsam sein. Nur für Debugging/kleine Datensätze verwenden.
 * @param pattern Das Muster für die Schlüssel (z.B. "position:*").
 * @returns Ein Array von passenden Schlüsseln.
 */
export async function getAllKeys(pattern: string = '*'): Promise<string[]> {
  const keys = await redis.keys(pattern);
  return keys || []; // Sicherstellen, dass ein Array zurückgegeben wird
}

/**
 * Löscht einen Schlüssel aus Redis.
 * @param key Der zu löschende Schlüssel.
 */
export async function delRedisKey(key: string): Promise<void> {
  await redis.del(key);
}

/**
 * Prüft, ob ein Token bereits getrackt wurde (z.B. durch ID).
 * @param tokenId Die ID des Tokens.
 * @returns true, wenn der Token getrackt ist, sonst false.
 */
export async function isTokenAlreadyTracked(tokenId: string): Promise<boolean> {
  const exists = await redis.exists(`tracked:${tokenId}`);
  return exists === 1; // exists gibt 1 oder 0 zurück
}

/**
 * Markiert ein Token als getrackt mit einer Ablaufzeit.
 * @param tokenId Die ID des Tokens.
 * @param ttlSeconds Die Lebensdauer in Sekunden (Standard: 6 Stunden).
 */
export async function trackTokenWithTTL(tokenId: string, ttlSeconds: number = 21600): Promise<void> {
  // `set` mit TTL-Option in Upstash Redis
  await redis.set(`tracked:${tokenId}`, '1', { ex: ttlSeconds });
}

/**
 * Speichert FomoScore und PumpRisk für einen Token.
 * @param tokenAddress Die Adresse des Tokens.
 * @param fomoScore Der FomoScore.
 * @param pumpRisk Das PumpRisk.
 */
export async function saveTokenScores(tokenAddress: string, fomoScore: string, pumpRisk: string): Promise<void> {
  await redis.hset(`token:${tokenAddress}`, {
    fomoScore,
    pumpRisk,
  });
}

/**
 * Ruft FomoScore und PumpRisk für einen Token ab.
 * @param tokenAddress Die Adresse des Tokens.
 * @returns Ein Objekt mit fomoScore und pumpRisk.
 */
export async function getTokenScores(tokenAddress: string): Promise<{ fomoScore: string, pumpRisk: string }> {
  const result = await redis.hgetall(`token:${tokenAddress}`);
  
    const fomoScore = typeof result?.fomoScore === 'string' ? result.fomoScore : 'N/A';
    const pumpRisk = typeof result?.pumpRisk === 'string' ? result.pumpRisk: 'N/A';

    return {
      fomoScore: fomoScore,
      pumpRisk: pumpRisk,
  };
}

/**
 * Ruft alle Wallets ab, die als "monitored" (Insider) markiert sind.
 * @returns Ein Array von Wallet-Adressen.
 */
export async function getMonitoredWallets(): Promise<string[]> {
  // `getAllKeys` aus dieser Datei nutzen
  const keys = await getAllKeys("insider:*"); // Annahme: Insider-Wallets sind mit "insider:" präfigiert
  return keys.map((key: string) => key.split(":")[1]); // Extrahiere die Adresse nach dem Präfix
}

/**
 * Ruft alle Wallets ab, die als "smartmoney" markiert sind.
 * @returns Ein Array von SmartMoney-Wallet-Adressen.
 */
export async function getSmartMoneyWallets(): Promise<string[]> {
  const keys = await getAllKeys("smartmoney:*"); // Annahme: SmartMoney-Wallets sind mit "smartmoney:" präfigiert
  return keys.map((key: string) => key.split(":")[1]);
}