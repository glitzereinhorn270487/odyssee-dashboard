// /lib/bot-status.ts
import redis from '@/lib/redisClient'; // Pfad ggf. anpassen
import { getRedisValue, setRedisValue as setRedisGenericValue } from '@/lib/redis'; // Importiere getRedisValue und setRedisValue als Alias

const BOT_STATUS_KEY = 'agent:status:running';

/**
 * Holt den aktuellen Status des Bots aus Redis.
 */
export async function getBotRunningStatus(): Promise<boolean> {
  try {
    // KORREKTUR: Verwende direkt redis.get, da wir einen einfachen String erwarten,
    // oder stelle sicher, dass getRedisValue den String korrekt zurückgibt.
    // getRedisValue parst JSON, was hier nicht nötig ist, da wir einen String 'true'/'false' speichern.
    const status = await redis.get<string>(BOT_STATUS_KEY); 
    console.log(`[BotStatusLib] Aktueller Status aus Redis (${BOT_STATUS_KEY}): '${status}' (Typ: ${typeof status})`); 
    return status === 'true'; 
  } catch (error) {
    console.error("Fehler beim Laden des Bot-Status aus Redis, nehme an ist gestoppt:", error);
    return false; 
  }
}

/**
 * Setzt den Status des Bots in Redis.
 */
export async function setBotRunningStatus(running: boolean): Promise<void> {
  try {
    const valueToSet = running ? 'true' : 'false'; 
    // KORREKTUR: Verwende direkt redis.set für einfache String-Werte
    await redis.set(BOT_STATUS_KEY, valueToSet); 
    console.log(`[BotStatusLib] Bot-Status in Redis gesetzt auf: '${valueToSet}'`); 
  } catch (error) {
    console.error("Fehler beim Speichern des Bot-status in Redis:", error);
  }
}
