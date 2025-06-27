import { kv } from "@vercel/kv";

export async function POST(req) {
  try {
    const data = await req.json();

    // Pflichtfelder validieren
    if (!data.token || !data.wallet || !data.cluster) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const key = `live:${data.token}:${data.wallet}`;
    await kv.set(key, data);

    return new Response(JSON.stringify({ success: true, key }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
