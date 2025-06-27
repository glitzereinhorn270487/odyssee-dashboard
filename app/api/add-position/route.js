import { kv } from "@vercel/kv";

export async function POST(req) {
  try {
    const data = await req.json();

    if (!data.token || !data.wallet || !data.cluster) {
      return new Response("Missing required fields", {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    const key = `live:${data.token}`;
    await kv.set(key, data);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",  // ← Das ist entscheidend
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON or KV error" }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  }
}