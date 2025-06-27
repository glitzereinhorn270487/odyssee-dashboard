export async function GET() {
  console.log("[AGENT-TICK] Cron Job triggered successfully");
  return new Response("Agent tick OK", { status: 200 });
}