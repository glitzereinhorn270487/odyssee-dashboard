// app/api/cron/route.ts
import { NextRequest } from "next/server";
import redis from "@/lib/redis"; // Pfad zu deiner Redis-Instanz

export async function GET(req: NextRequest) {
  const auth = req.headers.get("Authorization");
  const validSecret = `Bearer ${process.env.CRON_SECRET}`;

  if (auth !== validSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // ✅ Beispielaktion: Schreibe einen Testwert in Redis
    await redis.set("cron:heartbeat", new Date().toISOString());

    return new Response("✅ Cronjob erfolgreich ausgeführt", {
      status: 200,
    });
  } catch (err: any) {
    console.error("❌ Cronjob Fehler:", err);
    return new Response("Cronjob-Fehler: " + err?.message, {
      status: 500,
    });
  }
}

