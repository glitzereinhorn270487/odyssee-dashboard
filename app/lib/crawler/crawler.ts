import { setRedisValue } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function runCrawler() {
  console.log("[TEST-CRAWLER] Simulierter Aufruf");
}

export async function POST(req: Request) {
  const { address, cluster, note, scoreX, fomoScore, pumpRisk } = await req.json();

  await setRedisValue('wallet:${cluster}:${address}', {
    address,
    cluster,
    note: note || "",
    scoreX: scoreX || 0,
    fomoScore: fomoScore || "unbekannt",
    pumpRisk: pumpRisk || "unbekannt",
  });

  return NextResponse.json({ success: true });
}