// app/types/token.ts

export interface TradeCandidate {
  address: string;
  category?: string;
  score?: number;
  risk?: number;
  baseScore?: number;
  totalScore?: number;
  // ... weitere Felder je nach Bedarf
}