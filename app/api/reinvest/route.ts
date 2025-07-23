import { NextResponse } from "next/server";
import { checkAndReinvest } from "@/lib/reinvest-loop";

export async function GET() {
  try {
    await checkAndReinvest();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reinvest Cronjob Fehler:", err);
    return NextResponse.json({ success: false, error: err });
  }
}
