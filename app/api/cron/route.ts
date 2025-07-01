// app/api/cron/route.ts
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // ✅ HIER kommt deine Cron-Logik hin (z. B. Token scannen, Wallet-Daten updaten etc.)
  console.log("Cronjob erfolgreich ausgelöst!");

  return new Response("Cronjob OK", { status: 200 });
}