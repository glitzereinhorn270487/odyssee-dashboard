// app/api/test-env/route.ts

export async function GET() {
  return new Response(`Runtime HELIUS_API_KEY = ${process.env.HELIUS_API_KEY}`);
}