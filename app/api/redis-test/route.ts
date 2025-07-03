import redis from "@/lib/redis";

export async function GET() {
  try {
    await redis.set("ping", "pong");
    const val = await redis.get("ping");
    return new Response(JSON.stringify({ success: true, value: val }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
