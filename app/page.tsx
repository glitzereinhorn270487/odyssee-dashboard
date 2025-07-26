// app/page.tsx (DashboardPage.tsx) - ISOLIERTER TEST FÜR BOT-BUTTON
'use client';

import { useState } from 'react';

export default function DashboardPage() {
  const [botRunning, setBotRunning] = useState(false); // Simulierter Bot-Status

  // Extrem vereinfachte Funktion, die nur einen Alert auslöst
  const toggleBotStatusTest = () => {
    alert("TEST: Button wurde geklickt!");
    console.log("TEST: toggleBotStatusTest wurde aufgerufen!");
    setBotRunning(prev => !prev); // Simuliert das Umschalten des Status im Frontend
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        🌌 Odyssee Handelszentrale - Button Test
      </h1>

      {/* Bot-Status Button - Isoliert */}
      <div className="bg-gray-800 rounded-2xl p-8 shadow-lg flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4">🤖 Bot-Status Test</h2>
        <span className={`text-5xl font-bold mb-6 ${botRunning ? 'text-green-500' : 'text-red-500'}`}>
          {botRunning ? 'ONLINE' : 'OFFLINE'}
        </span>
        <button
          className={`px-8 py-3 rounded-xl text-xl font-bold text-white transition-all duration-300
                      ${botRunning ? 'bg-red-700 hover:bg-red-600' : 'bg-green-700 hover:bg-green-600'}`}
          onClick={toggleBotStatusTest}
        >
          {botRunning ? 'Bot Stoppen (Test)' : 'Bot Starten (Test)'}
        </button>
      </div>

      <p className="mt-8 text-gray-400">
        Wenn dieser Button nicht funktioniert, liegt ein grundlegendes Problem vor.
      </p>
    </div>
  );
}
