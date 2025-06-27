// app/api/agent-tick/route.js
export async function GET(request) {
  console.log("[AGENT-TICK] Cronjob ausgeführt");
  return new Response(JSON.stringify({ status: "Tick empfangen" }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}