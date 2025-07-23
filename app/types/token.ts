// app/types/token.ts

export interface TradeCandidate {
  address: string;
  category: string;
  score: number;
  risk?: number;
  baseScore: number;
  totalScore: number;
  token?: string;
  notice?: string;
  narrative?: string;
  type?: string;
  follower: number;
  winRate: number;
  rugRate: number;
  symbol: string;
  name: string;
  candidate?: string;
  fomoScore: string;
  pumpRisk: string;
  scoreX: number;
  alphaScore: number;
  influenceScore: number;
 
  // ... weitere Felder je nach Bedarf
}