// app/api/test-telegram/route.ts
import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";

export async function GET() {
  await sendTelegramMessage("🤖 Testnachricht von Odyssee-Agent.");
  return NextResponse.json({ status: "sent" });
}