export async function fetchNewRaydiumPools(): Promise<any[]> {
  try {
    const res = await fetch("https://metis-api.vercel.app/api/new-pools");
    const contentType = res.headers.get("content-type");

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    if (!contentType?.includes("application/json")) {
      const text = await res.text();
      throw new Error("Kein JSON: " + text.slice(0, 100)); // nur die ersten 100 Zeichen
    }

    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error("[HELIUS/METIS] Fehler beim Pool-Fetch:", error);
    return [];
  }
}
