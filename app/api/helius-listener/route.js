export async function GET() {
  console.log("[POSITION-MANAGER] Cron Job running");
  return new Response("Position manager OK", { status: 200 });
}