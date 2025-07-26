// /lib/bot-status.ts
import redis from '@/lib/redisClient'; 

const BOT_STATUS_KEY = 'agent:status:running';

/**
 * Holt den aktuellen Status des Bots aus Redis.
 */
export async function getBotRunningStatus(): Promise<boolean> {
  try {
    const status = await redis.get(BOT_STATUS_KEY); // KEIN expliziter Typ-Cast hier, um den Rohwert zu sehen
    console.log(`[BotStatusLib] GET - Rohwert aus Redis (${BOT_STATUS_KEY}): '${status}' (Typ: ${typeof status})`); 
    
    // WICHTIG: Wenn der Wert null ist, ist typeof null auch 'object'.
    // Wir müssen explizit prüfen, ob es der String 'true' ist.
    return status === 'true'; 
  } catch (error) {
    console.error("[BotStatusLib] Fehler beim Laden des Bot-Status aus Redis:", error);
    return false; 
  }
}

/**
 * Setzt den Status des Bots in Redis.
 */
export async function setBotRunningStatus(running: boolean): Promise<void> {
  try {
    const valueToSet = running ? 'true' : 'false'; 
    await redis.set(BOT_STATUS_KEY, valueToSet); 
    console.log(`[BotStatusLib] SET - Bot-Status in Redis gesetzt auf: '${valueToSet}'`); 
  } catch (error) {
    console.error("[BotStatusLib] Fehler beim Speichern des Bot-status in Redis:", error);
  }
}
