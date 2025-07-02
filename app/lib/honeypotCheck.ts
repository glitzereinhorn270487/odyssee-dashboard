// File: app/lib/honeypotCheck.ts
export async function isHoneypot(address: string): Promise<boolean> {
  const url = `https://api.honeypot.is/v1/solana/${address}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();

    // Beispielhafte Interpretation (anpassen falls nötig)
    return data.isHoneypot === true;
  } catch (err) {
    console.error(`[HONEYPOT API ERROR] ${address}:`, err);
    return true; // sicherheitshalber blockieren
  }
}

