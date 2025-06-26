// app/api/helius-listener/route.js
import { NextResponse } from 'next/server';
import WebSocket from 'ws';

// Diese Funktion wird nur einmal auf dem Server gestartet
function connectToHelius() {
  const HELIUS_RPC_URL = process.env.HELIUS_WEBSOCKET_URL;

  if (!HELIUS_RPC_URL) {
    console.error("FEHLER: Helius Websocket URL nicht in .env.local gefunden!");
    return;
  }

  const ws = new WebSocket(HELIUS_RPC_URL);

  ws.on('open', function open() {
    console.log('[HELIUS LISTENER] Verbindung erfolgreich hergestellt.');
    // Sende die "logSubscribe"-Anfrage, wie von Helius empfohlen
    ws.send(JSON.stringify({
      "jsonrpc": "2.0",
      "id": 1,
      "method": "logsSubscribe",
      "params": [
        {
          "mentions": ["675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"] // Raydium Liquidity Pool v4
        },
        {
          "commitment": "finalized"
        }
      ]
    }));
  });

  ws.on('message', function message(data) {
    const messageStr = data.toString('utf8');
    const messageObj = JSON.parse(messageStr);
    
    // Prüfe, ob es eine relevante Log-Nachricht ist
    if (messageObj.params && messageObj.params.result) {
        console.log('[HELIUS LISTENER] Neue relevante Transaktion empfangen!');
        // Hier rufen wir im nächsten Schritt unsere Analyse-Logik auf
        // z.B. analyseAndBuy(messageObj.params.result);
    }
  });

  ws.on('close', function close() {
    console.log('[HELIUS LISTENER] Verbindung getrennt. Versuche erneuten Verbindungsaufbau in 5 Sekunden...');
    setTimeout(connectToHelius, 5000);
  });

  ws.on('error', function error(err) {
    console.error('[HELIUS LISTENER] Ein Fehler ist aufgetreten:', err);
  });
}

// Starte den Listener-Prozess
connectToHelius();

// Diese Route dient nur dazu, einen Status zurückzugeben, der Listener läuft im Hintergrund
export async function GET(request) {
  return NextResponse.json({ status: 'Helius Listener is running.' });
}
