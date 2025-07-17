'use client';

import { useEffect, useState } from "react";

interface RedisEntry {
  key: string;
  value: string;
}

export default function RedisOverviewPage() {
  const [data, setData] = useState<RedisEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/get-keys");
        const json = await res.json();
        setData(json.data || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">🗂 Redis-Datenbankübersicht</h1>
      {loading ? (
        <p>Lade Daten...</p>
      ) : data.length === 0 ? (
        <p>Keine Einträge gefunden.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-2 border border-gray-700 text-left">🔑 Key</th>
                <th className="p-2 border border-gray-700 text-left">📦 Inhalt</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry) => (
                <tr key={entry.key} className="border-t border-gray-800">
                  <td className="p-2">{entry.key}</td>
                  <td className="p-2 whitespace-pre-wrap break-words">{JSON.stringify(entry.value, null, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
