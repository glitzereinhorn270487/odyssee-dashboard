// app/api/debug-wallet/route.ts
import { setRedisValue } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address, cluster, note, scoreX, fomoScore, pumpRisk } = body;

    if (!address || !cluster) {
      return NextResponse.json(
        { success: false, error: "Fehlende Daten: address oder cluster" },
        { status: 400 }
      );
    }

    // 🔧 Richtiger Template-String mit Backticks
    await setRedisValue(`wallet:${cluster}:${address}`, {
      address,
      cluster,
      note: note || "",
      scoreX: scoreX ?? 0,
      fomoScore: fomoScore ?? "unbekannt",
      pumpRisk: pumpRisk ?? "unbekannt",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
