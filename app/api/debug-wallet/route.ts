// app/api/debug-wallet/route.ts
import { getRedisValue } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");
  const cluster = searchParams.get("cluster");

  if (!wallet || !cluster)
    return NextResponse.json({ error: "wallet & cluster erforderlich" }, { status: 400 });

  const key = `wallets:${cluster.toLowerCase()}:${wallet}`;
  const value = await getRedisValue(key);

  return NextResponse.json({ key, value });
}
