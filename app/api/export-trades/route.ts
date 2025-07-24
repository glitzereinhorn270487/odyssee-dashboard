import { NextResponse } from 'next/server'
import  redis from '@/lib/redisClient' // Passe diesen Pfad ggf. an
import { format } from 'date-fns'
import { start } from 'repl'

export async function GET(req: Request) {
try {
  const { searchParams } =new URL(req.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  const allKeys = await redis.keys('position:*');
 } catch (error) {
 }
 return NextResponse.json({ error: `Start- und Enddatum erforderlich` }, { status: 400 })
}
