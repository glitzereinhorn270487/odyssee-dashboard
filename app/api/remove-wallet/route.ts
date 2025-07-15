// app/api/remove-wallet/route.ts

import { NextResponse } from "next/server";
import { setRedisValue, getRedisValue } from "@/lib/redis"; // je nach dem was du brauchst


export async function POST(req: Request) {
  try {
    const { wallet, category } = await req.json();

    if (!wallet || !category) {
      return NextResponse.json({ success: false, error: "Missing wallet or category" }, { status: 400 });
    }

    const key = `wallets:${category}`;
    await getRedisValue(wallet);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
