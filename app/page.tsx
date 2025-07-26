// app/page.tsx (DashboardPage.tsx)
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
  scoreX: number; 
  boostReasons: string[]; 
}

interface TelegramToggles {
  global: boolean;
  tradeSignals: boolean;
  gains: boolean;
  errors: boolean;
  nearMisses: boolean;
  moonshots: boolean;
  stagnationAlerts: boolean;
  tradePerformance: boolean;
  system: boolean;
  sales: boolean;
}

export default function DashboardPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [telegramToggles, setTelegramToggles] = useState<TelegramToggles>({
    global: true, tradeSignals: true, gains: true, errors: true, nearMisses: false,
    moonshots: true, stagnationAlerts: true, tradePerformance: true, system: true, sales: true
  }); 
  const [currentInvestmentLevel, setCurrentInvestmentLevel] = useState<string | null>(null);
  const [botRunning, setBotRunning] = useState(false); 
  const [totalTrades, setTotalTrades] = useState(0); 
  const [winRate, setWinRate] = useState(0); 
  const [currentVirtualCapital, setCurrentVirtualCapital] = useState<number>(0); // NEU: State für Kapital

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      console.log("[Dashboard] fetchData wird aufgerufen...");
      try {
        // --- Live Positionen abrufen ---
        const positionsResponse = await fetch('/api/live-positions');
        if (!positionsResponse.ok) console.error('Fehler beim Abrufen der Positionen: ' + positionsResponse.status);
        const positionsResult = await positionsResponse.json();
        setPositions(positionsResult.data.map((p: any) => ({
          ...p,
          scoreX: p.scoreX || 0, 
          boostReasons: p.boostReasons || [] 
        })) || []);
        console.log("[Dashboard] Positionen geladen:", positionsResult.data);


        // --- Telegram Toggles abrufen ---
        const telegramResponse = await fetch('/api/telegram-settings'); 
        if (!telegramResponse.ok) console.error('Fehler beim Abrufen der Telegram-Einstellungen');
        const telegramSettings = await telegramResponse.json();
        setTelegramToggles(telegramSettings || telegramToggles); 
        console.log("[Dashboard] Telegram Toggles geladen:", telegramSettings);

        // --- Investment Level abrufen ---
        const levelResponse = await fetch('/api/investment-level'); 
        if (!levelResponse.ok) console.error('Fehler beim Abrufen des Investment-Levels');
        const levelData = await levelResponse.json();
        setCurrentInvestmentLevel(levelData.level || 'Unbekannt');
        console.log("[Dashboard] Investment Level geladen:", levelData.level);

        // --- Bot Status abrufen ---
        const botStatusResponse = await fetch('/api/bot-status'); 
        if (!botStatusResponse.ok) console.error('Fehler beim Abrufen des Bot-Status');
        const botStatusData = await botStatusResponse.json();
        setBotRunning(botStatusData.running || false);
        console.log("[Dashboard] Bot Status geladen (von API):", botStatusData.running); // NEUER LOG
        
        // --- Virtuelles Kapital abrufen (NEU) ---
        const capitalResponse = await fetch('/api/virtual-capital'); // NEUER ENDPUNKT
        if (!capitalResponse.ok) console.error('Fehler beim Abrufen des virtuellen Kapitals');
        const capitalData = await capitalResponse.json();
        setCurrentVirtualCapital(capitalData.capital || 0);
        console.log("[Dashboard] Virtuelles Kapital geladen (von API):", capitalData.capital); // NEUER LOG

        // --- Performance Statistiken abrufen ---
        const perfStatsResponse = await fetch('/api/performance-stats');
        if (!perfStatsResponse.ok) console.error('Fehler beim Abrufen der Performance-Statistiken');
        const perfStatsData = await perfStatsResponse.json();
        setTotalTrades(perfStatsData.totalTrades || 0);
        setWinRate(perfStatsData.winRate || 0);
        console.log("[Dashboard] Performance Stats geladen:", perfStatsData);


      } catch (err: any) {
        setError(String(err));
        console.error("[Dashboard] Fehler in fetchData:", err);
      } finally {
        setIsLoading(false);
        console.log("[Dashboard] fetchData abgeschlossen.");
      }
    }
    fetchData();

    // Optional: Regelmäßiges Polling für Live-Updates (z.B. alle 30 Sekunden)
    const interval = setInterval(fetchData, 30000); 
    return () => clearInterval(interval);
  }, []);

  // --- Handhabung des Bot-Status ---
  const toggleBotStatus = async () => {
    console.log("toggleBotStatus wurde aufgerufen!"); 
    try {
      const action = botRunning ? 'stop' : 'start';
      console.log(`[Dashboard] Sende Bot-Kontrollaktion: ${action}`);
      const response = await fetch('/api/bot-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      console.log("[Dashboard] Fetch-Anfrage gesendet, Response erhalten. Status:", response.status, response.ok); 

      if (!response.ok) {
        const errorText = await response.text(); 
        throw new Error('Fehler beim Umschalten des Bot-Status: ' + response.status + ' - ' + errorText);
      }

      const data = await response.json();
      console.log("[Dashboard] Antwort vom Backend (data):", data); 
      console.log("[Dashboard] data.success:", data.success, "data.running:", data.running); 


      setBotRunning(data.running);
      console.log(`[Dashboard] Bot-Status im Frontend aktualisiert auf: ${data.running ? 'ONLINE' : 'OFFLINE'}.`); 

    } catch (err: any) {
      console.error(`[Dashboard] Fehler im toggleBotStatus Catch-Block: ${err.message}`);
    }
  };

  // --- Handhabung der Telegram Toggles ---
  const toggleTelegramSetting = async (key: keyof TelegramToggles) => {
    const newToggles = { ...telegramToggles, [key]: !telegramToggles[key] };
    setTelegramToggles(newToggles); 

    try {
      const response = await fetch('/api/telegram-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newToggles),
      });
      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Telegram-Einstellungen');
      }
      console.log(`[Dashboard] Telegram-Einstellung ${key} erfolgreich aktualisiert.`);
    } catch (err: any) {
      setError(`Fehler beim Speichern: ${err.message}`);
      setTelegramToggles(prev => ({ ...prev, [key]: !prev[key] })); 
    }
  };

  // Hilfsfunktion zur Darstellung der Boost-Icons
  const renderBoosts = (boosts: string[]) => {
    if (!boosts || boosts.length === 0) return '–';
    return boosts.map((boost, index) => {
      let icon = '';
      let label = boost;
      switch (boost) {
        case 'Insider-Beteiligung':
          icon = '🕵️‍♂️';
          break;
        case 'Smart-Money-Cluster':
        case 'Smart-Money-Beteiligung':
          icon = '🐳';
          break;
        case 'LP Burned/Locked': 
          icon = '🔒';
          break;
        default:
          icon = '✨'; 
      }
      return (
        <span key={index} className="flex items-center space-x-1 whitespace-nowrap">
          {icon} <span className="text-xs text-gray-400">{label}</span>
        </span>
      );
    });
  };

  // Hilfsfunktion zur Farbcodierung des ScoreX
  const getScoreXColor = (score: number) => {
    if (score >= 85) return 'text-green-400'; 
    if (score >= 70) return 'text-blue-300'; 
    if (score >= 60) return 'text-orange-300'; 
    return 'text-gray-400';
  };

  const pnlSum = positions.reduce((acc, p) => acc + (p.currentValueUsd - p.initialInvestmentUsd), 0);
  const invested = currentVirtualCapital; 
  const returnPerc = invested > 0 ? (pnlSum / invested) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-6">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        🌌 Odyssee Handelszentrale
      </h1>

      {/* Kontroll- und Übersichtsboxen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Bot-Status */}
        <div className="bg-gray-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between items-center">
          <h2 className="text-xl font-semibold mb-3">🤖 Bot-Status</h2>
          <span className={`text-3xl font-bold ${botRunning ? 'text-green-500' : 'text-red-500'}`}>
            {botRunning ? 'ONLINE' : 'OFFLINE'}
          </span>
          <button
            className={`mt-4 px-6 py-2 rounded-xl font-bold text-white transition-all duration-300
                        ${botRunning ? 'bg-red-700 hover:bg-red-600' : 'bg-green-700 hover:bg-green-600'}`}
            onClick={toggleBotStatus}
          >
            {botRunning ? 'Bot Stoppen' : 'Bot Starten'}
          </button>
        </div>

        {/* Gesamt-Portfolio */}
        <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
          <h2 className="text-xl font-semibold mb-3">💰 Gesamt-Portfolio</h2>
          <p className="text-3xl font-mono">
            {invested.toFixed(2)} <span className="text-gray-400 text-lg">$ Kapital</span> 
          </p>
          <p className={`text-3xl font-mono ${returnPerc >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {returnPerc.toFixed(2)}% <span className="text-gray-400 text-lg">G/V</span>
          </p>
        </div>

        {/* Investment-Level */}
        <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
          <h2 className="text-xl font-semibold mb-3">📈 Investment-Stufe</h2>
          <p className="text-4xl font-extrabold text-blue-400">
            {currentInvestmentLevel ?? 'Lade...'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Steuert Einsatzhöhe & Risikobereitschaft.
          </p>
        </div>

        {/* Performance Stats */}
        <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
          <h2 className="text-xl font-semibold mb-3">📊 Bot-Statistiken</h2>
          <p className="text-2xl font-mono">
            {totalTrades} <span className="text-gray-400 text-lg">Trades</span>
          </p>
          <p className="text-2xl font-mono text-cyan-400">
            {winRate.toFixed(2)}% <span className="text-gray-400 text-lg">Win Rate</span>
          </p>
        </div>
      </div>

      {/* Telegram Management */}
      <div className="bg-gray-800 rounded-2xl p-5 shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">✉️</span> Telegram-Benachrichtigungen
          <button
            className={`ml-auto px-4 py-2 rounded-full text-sm font-bold transition-colors duration-300
                        ${telegramToggles.global ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
            onClick={() => toggleTelegramSetting('global')}
          >
            {telegramToggles.global ? 'Global Aktiv' : 'Global Deaktiviert'}
          </button>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {Object.entries(telegramToggles).map(([key, value]) => (
            key !== 'global' && ( 
              <div key={key} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                <span className="text-sm font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => toggleTelegramSetting(key as keyof TelegramToggles)}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded"
                />
              </div>
            )
          ))}
        </div>
      </div>


      {/* Offene Positionen Tabelle */}
      <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
        <h2 className="text-xl font-bold mb-4">📂 Offene Positionen</h2>
        {isLoading ? (
          <p className="text-gray-400">Lade Positionen und Statistiken...</p>
        ) : error ? (
          <p className="text-red-500">Fehler: {error}</p>
        ) : positions.length === 0 ? (
          <p className="text-gray-400">Keine offenen Positionen.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-700 text-left text-gray-300">
                  <th className="p-3 rounded-tl-lg">Token</th>
                  <th className="p-3">Investiert ($)</th>
                  <th className="p-3">Aktuell ($)</th>
                  <th className="p-3">G/V (%)</th>
                  <th className="p-3">Strategie</th>
                  <th className="p-3">ScoreX</th>
                  <th className="p-3 rounded-tr-lg">Boosts</th>
                </tr>
              </thead>
              <tbody>
                {positions.map(pos => (
                  <tr key={pos.tradeId} className="border-t border-gray-700 hover:bg-gray-700 transition-colors duration-200">
                    <td className="p-3 font-medium text-white">{pos.tokenSymbol}</td>
                    <td className="p-3">{pos.initialInvestmentUsd.toFixed(2)}</td>
                    <td className="p-3">{pos.currentValueUsd.toFixed(2)}</td>
                    <td className={`p-3 font-semibold ${pos.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pos.pnlPercentage.toFixed(2)}%
                    </td>
                    <td className="p-3 text-gray-300">{pos.strategy ?? '–'}</td>
                    <td className={`p-3 font-bold ${getScoreXColor(pos.scoreX)}`}>
                      {pos.scoreX.toFixed(0)}
                    </td>
                    <td className="p-3 space-y-1">
                      {renderBoosts(pos.boostReasons)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Export Trades Komponente */}
      <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
        <ExportTrades />
      </div>
    </div>
  );
}
