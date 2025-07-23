import { getRedisValue } from "@/lib/redis";
import { NextResponse } from "next/server";
import {getAllKeys} from "@/lib/redis"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keys = await getAllKeys();
  return new Response(JSON.stringify({ success: true, keys}, null, 2))
}