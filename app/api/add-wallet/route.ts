// app/api/add-wallet/route.ts

import { NextResponse } from "next/server";
import { setRedisValue } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { wallet, cluster } = body;

    if (!wallet || !cluster) {
      return NextResponse.json({ success: false, error: "Missing wallet or cluster" }, { status: 400 });
    }

    const key = `wallets:${cluster.toLowerCase()}:${wallet}`;
    await setRedisValue(key, body); // speichert den gesamten JSON-Body
    console.log("[WALLET GESPEICHERT]", key, );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
