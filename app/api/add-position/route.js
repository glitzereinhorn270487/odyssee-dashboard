import Redis from "ioredis";

const redis = new Redis(process.env.KV_REST_API_URL);

// OPTIONS-Anfrage behandeln (für CORS Preflight)
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// POST-Anfrage behandeln
export async function POST(req) {
  try {
    const data = await req.json();

    if (!data.token || !data.wallet || !data.cluster) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    const key = `live:${data.token}`;
    await redis.set(key, JSON.stringify(data));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON or Redis error", detail: err.message }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  }
}
