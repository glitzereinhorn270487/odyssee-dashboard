'use client';

import { useState, useEffect } from 'react';

// Datentyp-Definition für eine einzelne Position
interface Position {
  tradeId: string;
  tokenSymbol: string;
  initialInvestmentUsd: number;
  currentValueUsd: number;
  pnlPercentage: number;
}

export default function DashboardPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLivePositions() {
      try {
        // Dieser Pfad ruft unsere eigene, lokale API auf.
        const API_URL = '/api/live-positions'; 
        
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Netzwerk-Antwort war nicht ok. Status: ' + response.status);
        }
        
        const result = await response.json();
        setPositions(result.data || []); 
        
      } catch (error) {
        console.error("Fehler beim Abrufen der Positionen:", error);
        setError(String(error));
      } finally {
        setIsLoading(false);
      }
    }
    fetchLivePositions();
  }, []);

  if (isLoading) { return <div>Lade Live-Positionen...</div>; }
  if (error) { return <div>Fehler: {error}</div>; }

  return (
    <div style={{ color: 'white', backgroundColor: '#111827', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Dashboard: Live-Positionen</h1>
      {positions.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #374151', padding: '0.75rem', textAlign: 'left' }}>Token</th>
              <th style={{ border: '1px solid #374151', padding: '0.75rem', textAlign: 'left' }}>Investition (USD)</th>
              <th style={{ border: '1px solid #374151', padding: '0.75rem', textAlign: 'left' }}>Aktueller Wert (USD)</th>
              <th style={{ border: '1px solid #374151', padding: '0.75rem', textAlign: 'left' }}>G/V (%)</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(pos => (
              <tr key={pos.tradeId}>
                <td style={{ border: '1px solid #374151', padding: '0.75rem' }}>{pos.tokenSymbol}</td>
                <td style={{ border: '1px solid #374151', padding: '0.75rem' }}>{pos.initialInvestmentUsd.toFixed(2)}</td>
                <td style={{ border: '1px solid #374151', padding: '0.75rem' }}>{pos.currentValueUsd.toFixed(2)}</td>
                <td style={{ border: '1px solid #374151', padding: '0.75rem', color: pos.pnlPercentage >= 0 ? '#4ade80' : '#f87171' }}>
                  {pos.pnlPercentage.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Aktuell sind keine Positionen offen.</p>
      )}
    </div>
  );
}
