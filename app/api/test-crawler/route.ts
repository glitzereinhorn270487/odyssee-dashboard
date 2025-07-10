// app/api/test-crawler/route.ts
import { runCrawler } from "@/lib/crawler/crawler";
export async function GET() {
  await runCrawler();
  return Response.json({ success: true });
}
