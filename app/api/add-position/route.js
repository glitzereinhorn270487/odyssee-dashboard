// app/api/add-position/route.js
import Redis from "ioredis";

const redis = new Redis(process.env.KV_REST_API_URL);

export async function POST(req) {
  try {
    const data = await req.json();

    if (!data.token || !data.wallet || !data.cluster) {
      return new Response("Missing required fields", {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const key = `live:${data.token}`;
    await redis.set(key, JSON.stringify(data));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
