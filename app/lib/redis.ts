// lib/redis.ts

export async function setRedisValue(key: string, value: any): Promise<void> {
  try {
    await fetch(`${REST_URL}/set/${key}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value: typeof value === "string" ? value : JSON.stringify(value) }),
      // 🔧 Doppelt absichern: Wandelt alles zu String um
    });
  } catch (error) {
    console.error("[REDIS-SET FEHLER]", error);
  }
}
