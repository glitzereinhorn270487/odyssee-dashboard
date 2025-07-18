import { getAllKeys, getRedisValue } from "@/lib/redis";

export async function GET() {
  try {
    const rawKeys = await getAllKeys();

    const filtered = rawKeys.filter((key) =>
      key.startsWith("wallets:redflag:") || key.startsWith("redflag:")
    );

    const entries = await Promise.all(
      filtered.map(async (key) => {
        const value = await getRedisValue(key);
        return { key, value };
      })
    );

    return new Response(
      `
        <html>
          <head><title>Redis Übersicht</title></head>
          <body>
            <h1>📦 Redflag Wallets</h1>
            <p>Gefundene Einträge: <strong>${entries.length}</strong></p>
            <table border="1" cellpadding="6" cellspacing="0">
              <tr>
                <th>Key</th>
                <th>Value</th>
              </tr>
              ${entries
                .map(
                  (entry) => `
                <tr>
                  <td>${entry.key}</td>
                  <td><pre>${JSON.stringify(entry.value, null, 2)}</pre></td>
                </tr>
              `
                )
                .join("")}
            </table>
          </body>
        </html>
      `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  } catch (error) {
    return new Response("❌ Fehler beim Laden der Redis-Daten", {
      status: 500,
    });
  }
}
