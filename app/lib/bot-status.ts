// /lib/bot-status.ts
import redis from '@/lib/redisClient'; // Pfad ggf. anpassen

const BOT_STATUS_KEY = 'agent:status:running';

/**
 * Holt den aktuellen Status des Bots aus Redis.
 */
export async function getBotRunningStatus(): Promise<boolean> {
  try {
    const status = await redis.get<string>(BOT_STATUS_KEY);
    return status === 'true'; // Speichern als String, holen als Boolean
  } catch (error) {
    console.error("Fehler beim Laden des Bot-Status aus Redis, nehme an ist gestoppt:", error);
    return false; // Im Fehlerfall als gestoppt annehmen
  }
}

/**
 * Setzt den Status des Bots in Redis.
 */
export async function setBotRunningStatus(running: boolean): Promise<void> {
  try {
    await redis.set(BOT_STATUS_KEY, running ? 'true' : 'false');
  } catch (error) {
    console.error("Fehler beim Speichern des Bot-Status in Redis:", error);
  }
}