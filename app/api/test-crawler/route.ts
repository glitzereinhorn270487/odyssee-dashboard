// app/api/test-crawler/route.ts
import { runCrawler } from "@/lib/crawler/crawler";

export async function GET() {
  console.log("[TEST-CRAWLER] Endpoint wurde aufgerufen");

  await runCrawler();

  console.log("[TEST-CRAWLER] runCrawler wurde beendet");

  return Response.json({ success: true });
}
