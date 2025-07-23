// app/api/cron-tick/route.ts
import { NextResponse } from "next/server";
import { checkAndReinvest } from "@/lib/reinvest-loop";

export async function GET() {
  try {
  await checkAndReinvest("G4WaYDoB8huCBmWJ7roVK9q5p4N1LUET4rYpwCPmfPVs");
  return NextResponse.json({ success: true });
} catch (error) {
  console.error("Fehler im Cronjob:", error);
  return NextResponse.json({success: false, error: String(error) });
}
}
