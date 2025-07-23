'use client';

import { useState, useEffect } from 'react';
import ExportTrades from "./components/dashboard/ExportTrades";
interface Position {
  tradeId: string;
  tokenSymbol: string;
  initialInvestmentUsd: number;
  currentValueUsd: number;
  pnlPercentage: number;
  strategy?: string;
  score?: number;
  boost?: string;
}

export default function DashboardPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [telegramEnabled, setTelegramEnabled] = useState(true); // Beispieltoggle
  useEffect(() => {
   
    async function fetchLivePositions() {
      try {
        const response = await fetch('/api/live-positions');
        if (!response.ok) throw new Error('Fehler beim Abrufen: ' + response.status);
        const result = await response.json();
        setPositions(result.data || []);
      } catch (err) {
        setError(String(err));
      } finally {
        setIsLoading(false);
      }
    }
    fetchLivePositions();
  }, []);
  
  const pnlSum = positions.reduce((acc, p) => acc + (p.currentValueUsd - p.initialInvestmentUsd), 0);
  const invested = positions.reduce((acc, p) => acc + p.initialInvestmentUsd, 0);
  const returnPerc = invested > 0 ? (pnlSum / invested) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold">📊 Odyssee Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-2xl p-4 shadow">
          <h2 className="text-lg">💰 Gesamte Investition</h2>
          <p className="text-2xl font-mono">{invested.toFixed(2)} $</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-4 shadow">
          <h2 className="text-lg">📈 Gesamt-Gewinn/Verlust</h2>
          <p className={`text-2xl font-mono ${returnPerc >= 0 ? 'text-green-400' : 'text-red-400'}`}>{returnPerc.toFixed(2)}%</p>
        </div>
        <ExportTrades />
        <div className="bg-gray-800 rounded-2xl p-4 shadow">
          <h2 className="text-lg">📬 Telegram-Status</h2>
          <button
            className={`mt-2 px-4 py-2 rounded font-bold ${telegramEnabled ? 'bg-green-600' : 'bg-red-600'}`}
            onClick={() => setTelegramEnabled(!telegramEnabled)}
          >
            {telegramEnabled ? 'Aktiviert' : 'Deaktiviert'}
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl p-4 shadow">
        <h2 className="text-xl font-bold mb-4">📂 Offene Positionen</h2>
        {isLoading ? (
          <p>Lade Positionen...</p>
        ) : error ? (
          <p className="text-red-500">Fehler: {error}</p>
        ) : positions.length === 0 ? (
          <p>Keine offenen Positionen.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-700 text-left">
                  <th className="p-2">Token</th>
                  <th className="p-2">Investiert</th>
                  <th className="p-2">Aktuell</th>
                  <th className="p-2">G/V (%)</th>
                  <th className="p-2">Strategie</th>
                  <th className="p-2">Score</th>
                  <th className="p-2">Boost</th>
                </tr>
              </thead>
              <tbody>
                {positions.map(pos => (
                  <tr key={pos.tradeId} className="border-t border-gray-700">
                    <td className="p-2">{pos.tokenSymbol}</td>
                    <td className="p-2">{pos.initialInvestmentUsd.toFixed(2)} $</td>
                    <td className="p-2">{pos.currentValueUsd.toFixed(2)} $</td>
                    <td className={`p-2 ${pos.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pos.pnlPercentage.toFixed(2)}%</td>
                    <td className="p-2">{pos.strategy ?? '–'}</td>
                    <td className="p-2">{pos.score ?? '–'}</td>
                    <td className="p-2">{pos.boost ?? '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
