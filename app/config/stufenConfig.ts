// Datei: app/config/stufenConfig.ts

export type Stufen = {
  id: string;
  name: string;
  kapital: number;
  beschreibung: string;
  maxSlippage: number;
  boosterKapital: number;
};

export const stufenConfig: Record<string, Stufen> = {
  M0: {
    id: "M0",
    name: "Micro-Stufe 0",
    kapital: 15,
    beschreibung: "Initial-Test mit minimalem Kapital",
    maxSlippage: 2.5,
    boosterKapital: 0,
  },
  M1: {
    id: "M1",
    name: "Micro-Stufe 1",
    kapital: 30,
    beschreibung: "Früher Entry mit leicht erhöhter Slippage",
    maxSlippage: 3,
    boosterKapital: 5,
  },
  // Füge M2–M5 hinzu
};
