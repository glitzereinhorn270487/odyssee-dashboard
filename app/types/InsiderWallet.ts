export interface InsiderWallet {
  wallet: string;
  cluster: "Insider";
  note?: string;
  alphaScore: number;
  influenceScore: number;
  performanceScore: number;
  winRate: number;
  scoreX: number;
  tokenImpactScore: number;
  socialScore: number;
  reachScore: number;
  follower: number;
  xProfile: string;
  telegram?: string;
  boosts: string[];
  firstSeen: number;
  narrative?: string;
}
