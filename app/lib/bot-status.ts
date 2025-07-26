// /lib/bot-status.ts
import redis from '@/lib/redisClient'; // Pfad ggf. anpassen

const BOT_STATUS_KEY = 'agent:status:running';

/**
 * Holt den aktuellen Status des Bots aus Redis.
 */
export async function getBotRunningStatus(): Promise<boolean> {
  try {
    // KORREKTUR: Holt den Rohwert aus Redis und behandelt ihn als string oder null.
    // Der Typ 'boolean' in deinem Log ist irreführend, der Rohwert ist wahrscheinlich ein String 'true' oder 'false'.
    const status: string | null = await redis.get(BOT_STATUS_KEY); 
    console.log(`[BotStatusLib] GET - Rohwert aus Redis (${BOT_STATUS_KEY}): '${status}' (JS Typ: ${typeof status})`); 
    
    // KORREKTUR: Robuster Check für den Status.
    // Prüfe, ob der Status der String 'true' ist.
    // Wenn Redis die Zahl 1 speichert (was nicht passieren sollte, wenn wir 'true' als String setzen),
    // dann würde String(status) === '1' auch funktionieren.
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
    // KORREKTUR: Explizit den String 'true' oder 'false' speichern.
    const valueToSet: string = running ? 'true' : 'false'; 
    await redis.set(BOT_STATUS_KEY, valueToSet); 
    console.log(`[BotStatusLib] SET - Bot-Status in Redis gesetzt auf: '${valueToSet}'`); 
  } catch (error) {
    console.error("Fehler beim Speichern des Bot-status in Redis:", error); 
  }
}
