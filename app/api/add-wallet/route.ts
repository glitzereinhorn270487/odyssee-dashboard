// app/api/add-wallet/route.ts
import { NextResponse } from "next/server";
import { setRedisValue } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { wallet, category } = body;

    if (!wallet || !category) {
      return NextResponse.json({ success: false, error: "Missing wallet or category" }, { status: 400 });
    }

    const key = `wallets:${category.toLowerCase()}:${wallet}`;
    console.log("[DEBUG] Speichere Key:", key);
    console.log("[DEBUG] Body:", JSON.stringify(body, null, 2));

    await setRedisValue(key, body);

    return NextResponse.json({ success: true, savedKey: key });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
