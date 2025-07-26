// /lib/bot-status.ts
import redis from '@/lib/redisClient'; // Pfad ggf. anpassen

const BOT_STATUS_KEY = 'agent:status:running';

/**
 * Holt den aktuellen Status des Bots aus Redis.
 */
export async function getBotRunningStatus(): Promise<boolean> {
  try {
    // KORREKTUR: Expliziter Typ-Cast auf string | null, um sicherzustellen, dass TypeScript den Typ korrekt erkennt.
    // redis.get sollte einen String oder null zurückgeben.
    const status: string | null = await redis.get(BOT_STATUS_KEY); 
    console.log(`[BotStatusLib] Aktueller Status aus Redis (${BOT_STATUS_KEY}): '${status}' (Typ: ${typeof status})`); 
    
    // KORREKTUR: Prüfe explizit auf 'true' als String.
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
    const valueToSet = running ? 'true' : 'false'; // Speichern als String 'true' oder 'false'
    await redis.set(BOT_STATUS_KEY, valueToSet); 
    console.log(`[BotStatusLib] Bot-Status in Redis gesetzt auf: '${valueToSet}'`); 
  } catch (error) {
    console.error("Fehler beim Speichern des Bot-status in Redis:", error);
  }
}
