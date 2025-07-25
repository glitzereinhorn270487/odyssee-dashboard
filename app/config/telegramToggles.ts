// /config/telegramToggles.ts
import redis from '@/lib/redisClient'; // Pfad ggf. anpassen

export interface TelegramToggles {
  global: boolean;
  tradeSignals: boolean;
  gains: boolean;
  errors: boolean;
  nearMisses: boolean;
  moonshots: boolean;
  stagnationAlerts: boolean;
  tradePerformance: boolean;
  system: boolean;
  sales: boolean;
}

const DEFAULT_TOGGLES: TelegramToggles = {
  global: true,
  tradeSignals: true,
  gains: true,
  errors: true,
  nearMisses: false,
  moonshots: true,
  stagnationAlerts: true,
  tradePerformance: true,
  system: true,
  sales: true,
};

/**
 * Holt die aktuellen Telegram-Toggle-Einstellungen aus Redis.
 * Falls keine Einstellungen in Redis gefunden werden, werden Standardwerte verwendet und gespeichert.
 */
export async function getTelegramToggles(): Promise<TelegramToggles> {
  try {
    const storedToggles = await redis.get<TelegramToggles>('config:telegramToggles');
    if (storedToggles) {
      return { ...DEFAULT_TOGGLES, ...storedToggles }; // Merge mit Defaults, falls neue Toggles hinzugefügt werden
    } else {
      await redis.set('config:telegramToggles', DEFAULT_TOGGLES);
      return DEFAULT_TOGGLES;
    }
  } catch (error) {
    console.error("Fehler beim Laden der Telegram-Toggles aus Redis, verwende Defaults:", error);
    return DEFAULT_TOGGLES;
  }
}

/**
 * Speichert die Telegram-Toggle-Einstellungen in Redis.
 */
export async function setTelegramToggles(toggles: TelegramToggles): Promise<void> {
  try {
    await redis.set('config:telegramToggles', toggles);
  } catch (error) {
    console.error("Fehler beim Speichern der Telegram-Toggles in Redis:", error);
    // Hier könntest du eine Fehlerbehandlung einbauen, z.B. eine Alert-Nachricht
  }
}