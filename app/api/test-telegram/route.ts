// app/api/test-telegram/route.ts
import { NextResponse } from "next/server";
import { sendTelegramBuyMessage } from "@/lib/telegram";

export async function GET() {
  await sendTelegramBuyMessage
  return NextResponse.json({ status: "sent" });
}