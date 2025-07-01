import redis from "@/lib/redis";

export async function GET(req: Request) {
  if (!redis.status || redis.status !== "ready") {
    console.error("❌ Redis ist nicht verbunden:", redis.status);
    return new Response("Redis nicht verbunden", { status: 503 });
  }

  try {
    await redis.set("cron:check", new Date().toISOString());
    return new Response("✅ Cronjob ausgeführt");
  } catch (err) {
    console.error("❌ Redis-Fehler:", err);
    return new Response("Fehler beim Schreiben in Redis", { status: 500 });
  }
}

