import { Redis } from 'ioredis';

// Lese die URL aus den Umgebungsvariablen, die du in Vercel gesetzt hast.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;

if (!redisUrl) {
  // Wenn die URL nicht gefunden wird, breche den Prozess ab und gib einen klaren Fehler aus.
  // Das verhindert, dass der Code versucht, sich mit localhost zu verbinden.
  throw new Error("FATAL: UPSTASH_REDIS_REST_URL is not defined in the environment variables.");
}

// Erstelle die Redis-Instanz mit der korrekten URL.
const redis = new Redis ( );

 {
  console.error('[REDIS_CLIENT_ERROR]');
};

export default redis;