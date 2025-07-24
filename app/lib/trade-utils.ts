import redis from "./redisClient"; // Stellt sicher, dass der Client korrekt importiert wird

// --- Generische Redis-Helfer ---

export async function getAllKeys(pattern: string): Promise<string[]> {
  return redis.keys(pattern);
}

export async function getRedisValue<T>(key: string): Promise<T | null> {
  const value = (await redis.get(key)) as string | null;
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Fehler beim Parsen von JSON für Key ${key}:`, error);
    return null;
  }
}

// --- Trade & Export Funktionen ---

/**
 * Ruft alle Trades ab, die unter dem Muster 'position:*' gespeichert sind.
 */
export async function getAllTrades(): Promise<any[]> {
  const tradeKeys = await redis.keys("position:*");
  const trades = await Promise.all(
    tradeKeys.map(async (key: string) => {
      return await getRedisValue<any>(key);
    })
  );
  // Filtert null-Werte heraus, falls einige Keys leer waren oder Fehler aufgetreten sind
  return trades.filter((trade) => trade !== null);
}

/**
 * Filtert eine Liste von Trades nach einem Datumsbereich.
 */
export function filterTradesByDate(trades: any[], start: string, end: string): any[] {
  return trades.filter((trade) => {
    if (!trade || typeof trade.timestamp !== "number") return false;
    const date = new Date(trade.timestamp);
    return date >= new Date(start) && date <= new Date(end);
  });
}

/**
 * Konvertiert ein Array von Objekten in einen CSV-String.
 */
export function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return "Keine Daten für den Export vorhanden";
  }

  const headers = Object.keys(data[0]);
  const lines = data.map((obj) =>
    headers.map((key) => `"${obj[key] ?? ""}"`).join(",")
  );

  return [headers.join(","), ...lines].join("\n");
}