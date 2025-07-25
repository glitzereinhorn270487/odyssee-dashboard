// app/api/export-trades/route.ts

import { NextResponse } from 'next/server';
import redis from '@/lib/redisClient'; // Korrekter Import des Redis-Clients

// --- HELPER-FUNKTIONEN FÜR DATUMSFILTERUNG UND CSV-KONVERTIERUNG ---
// Diese Funktionen wurden hierher verschoben, um Syntaxfehler in der früheren Version zu vermeiden
// und um sicherzustellen, dass sie korrekt in der Route verwendet werden können.

/**
 * Filtert Trades nach einem gegebenen Start- und Enddatum.
 * @param trades Array von Trade-Objekten.
 * @param startDateString Startdatum im Format 'YYYY-MM-DD'.
 * @param endDateString Enddatum im Format 'YYYY-MM-DD'.
 * @returns Gefiltertes Array von Trade-Objekten.
 */
function filterTradesByDate(trades: any[], startDateString: string, endDateString: string): any[] {
  const start = new Date(startDateString);
  // Füge einen Tag zum Enddatum hinzu, um es inklusiv zu machen, und setze die Zeit auf 23:59:59
  const end = new Date(endDateString);
  end.setDate(end.getDate() + 1); // Macht das Enddatum inklusiv bis zum Ende des Tages
  end.setHours(0, 0, 0, 0); // Setzt Zeit auf Mitternacht des nächsten Tages
  
  return trades.filter(trade => {
    // Überprüfe, ob trade.timestamp existiert und ein gültiger Zeitstempel ist.
    // Annahme: trade.timestamp ist eine Zahl (milliseconds since epoch)
    const tradeDate = new Date(trade.timestamp);
    return tradeDate >= start && tradeDate < end; // Kleiner als 'end' (Mitternacht des nächsten Tages)
  });
}

/**
 * Konvertiert ein Array von Objekten in eine CSV-String-Darstellung.
 * @param data Array von Objekten, die exportiert werden sollen.
 * @returns CSV-String.
 */
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return "Keine Daten für den angegebenen Zeitraum gefunden.";
  }

  // Header Zeile erstellen
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.map(header => `"${header}"`).join(',');

  // Datenzeilen erstellen
  const csvRows = data.map(row => {
    return headers.map(header => {
      let value = row[header];
      if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value); // Konvertiere Objekte/Arrays zu JSON-String
      }
      return `"${String(value).replace(/"/g, '""')}"`; // Escaping doppelte Anführungszeichen
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}


// --- API ROUTE HANDLER ---

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start- und Enddatum erforderlich' }, { status: 400 });
    }

    // Alle "position:*" Schlüssel abrufen
    const allKeys = await redis.keys('position:*');
    
    // Alle Daten für diese Schlüssel abrufen
    // Alle Daten für diese Schlüssel abrufen
    const rawPositions = await Promise.all(
      allKeys.map(async (key: string) => {
        // KORREKTUR: Expliziter Typ-Cast zu string | null für 'raw'
        const raw: string | null = await redis.get(key); 
        if (raw === null) return null; // Sicherstellen, dass raw ein String ist, wenn nicht null
        try {
          return JSON.parse(raw); // Jetzt ist 'raw' sicher ein String
        } catch (parseError) {
          console.error(`Fehler beim Parsen von Redis-Key ${key}: ${raw}`, parseError);
          return null;
        }
      })
    );


    // Entferne null-Werte und filtere nach Datum
    const validPositions = rawPositions.filter(p => p !== null);
    const filteredTrades = filterTradesByDate(validPositions, startDate, endDate);

    // Konvertiere die gefilterten Daten ins CSV-Format
    const csvContent = convertToCSV(filteredTrades);

    // Sende die CSV-Datei als Antwort
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="trades_${startDate}_bis_${endDate}.csv"`,
      },
    });

  } catch (error: any) {
    console.error('Fehler beim Exportieren der Trades:', error);
    return NextResponse.json({ error: 'Interner Serverfehler beim Exportieren der Trades', details: error.message }, { status: 500 });
  }
}