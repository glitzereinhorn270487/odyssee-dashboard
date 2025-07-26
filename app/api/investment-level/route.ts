// app/api/investment-level/route.ts

import { NextResponse } from 'next/server';
import redis from '@/lib/redisClient'; // Korrekter Pfad zum Redis-Client

export async function GET() {
  try {
    // Holt das aktuelle globale Investment-Level aus Redis
    const level = await redis.get<string>('wallet:global:level');
    return NextResponse.json({ level: level || 'NONE' }); // Gib 'NONE' zurück, falls kein Level gesetzt ist
  } catch (error: any) {
    console.error("Fehler beim Abrufen des Investment-Levels:", error);
    return NextResponse.json({ error: "Interner Serverfehler", details: error.message }, { status: 500 });
  }
}
