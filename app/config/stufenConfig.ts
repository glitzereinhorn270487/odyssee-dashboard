// stufenConfig.ts

export interface InvestmentStufe {
  id: string;
  name: string;
  kapital: number;
  beschreibung: string;
  maxSlippage: number;
  boosterKapital: number;
}

export const stufen: InvestmentStufe[] = [
  {
    id: "M0",
    name: "Mikro-Stufe 0",
    kapital: 5,
    beschreibung: "Einstiegskapital für Watchlist-Scoring oder experimentelle Token.",
    maxSlippage: 15,
    boosterKapital: 2,
  },
  {
    id: "M1",
    name: "Mikro-Stufe 1",
    kapital: 10,
    beschreibung: "Erste Bestätigung durch Smart Money oder Buzz-Signal.",
    maxSlippage: 12,
    boosterKapital: 3,
  },
  {
    id: "M2",
    name: "Mikro-Stufe 2",
    kapital: 20,
    beschreibung: "Token wurde auf Telegram erwähnt und hat niedrigen RugScore.",
    maxSlippage: 10,
    boosterKapital: 5,
  },
  {
    id: "M3",
    name: "Mikro-Stufe 3",
    kapital: 30,
    beschreibung: "Token hat Insider-Wallet-Aktivität und solides On-Chain-Volumen.",
    maxSlippage: 8,
    boosterKapital: 10,
  },
  {
    id: "M4",
    name: "Mikro-Stufe 4",
    kapital: 55,
    beschreibung: "Stabile Performance, mehrfach erwähnt durch Narrative-Maker.",
    maxSlippage: 6,
    boosterKapital: 15,
  },
  {
    id: "M5",
    name: "Mikro-Stufe 5",
    kapital: 120,
    beschreibung: "Volle Entry-Stufe für starke S-Tier Token mit hohem Gesamt-Score.",
    maxSlippage: 5,
    boosterKapital: 25,
  },
];
