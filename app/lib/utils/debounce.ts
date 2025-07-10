// app/lib/utils/debounce.ts
const callTimestamps = new Map<string, number>();

export function debounce(id: string, waitMs: number): boolean {
  const now = Date.now();
  const last = callTimestamps.get(id) || 0;
  if (now - last < waitMs) return false;
  callTimestamps.set(id, now);
  return true;
}
