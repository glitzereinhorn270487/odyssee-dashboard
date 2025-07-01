// Datei: app/config/stufenConfig.ts

export type Stufen = {
  id: string;
  name: string;
  kapital: number;
  beschreibung: string;
  maxSlippage: number;
  boosterKapital: number;
  minScore: number;
  maxRisk: number;
};

export const stufenConfig: Record<string, Stufen> = {
  M0: {
    id: "M0",
    name: "Micro-Stufe 0",
    kapital: 25,
    beschreibung: "Kleinstkapital Einstieg",
    maxSlippage: 5,
    boosterKapital: 0,
    minScore: 70,
    maxRisk: 40
  },
  M1: {
    id: "M1",
    name: "Micro-Stufe 1",
    kapital: 50,
    beschreibung: "Kleiner Einstieg mit mehr Risiko",
    maxSlippage: 6,
    boosterKapital: 10,
    minScore: 75,
    maxRisk: 35
  },
  // Füge M2–M5 hinzu
};
