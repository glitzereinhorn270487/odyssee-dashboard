// app/api/agent-tick/route.ts
import { GET as heliusListener } from "@/app/api/find-new-tokens/route";
import { isHoneypot } from "@/lib/honeypotCheck";

// ...

const honeypot = await isHoneypot(token.address);
if (honeypot) {
  console.log(`⛔ BLOCKIERT (HONEYPOT): ${token.symbol}`);
  continue;
}
export async function GET() {
  console.log("[AGENT-TICK] getriggert via Vercel Cron Job");
  return await heliusListener();
}