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
  M2: {
    id: "M2",
    name: "Micro-Stufe 2",
    kapital: 85,
    beschreibung: "Solide Stufe mit Booster-Spielraum",
    maxSlippage: 5,
    boosterKapital: 20,
    minScore: 76,
    maxRisk: 32
  },
  M3: {
    id: "M3",
    name: "Micro-Stufe 3",
    kapital: 120,
    beschreibung: "Strategisch optimierte Reinvest-Stufe",
    maxSlippage: 4.5,
    boosterKapital: 30,
    minScore: 77,
    maxRisk: 30
  },
  M4: {
    id: "M4",
    name: "Micro-Stufe 4",
    kapital: 180,
    beschreibung: "Fortgeschrittene Stufe mit gutem Puffer",
    maxSlippage: 4,
    boosterKapital: 40,
    minScore: 78,
    maxRisk: 28
  },
  M5: {
    id: "M5",
    name: "Micro-Stufe 5",
    kapital: 250,
    beschreibung: "Obergrenze der Micro-Stufen – bereit für Scaling",
    maxSlippage: 3.5,
    boosterKapital: 50,
    minScore: 80,
    maxRisk: 25
  }
};
