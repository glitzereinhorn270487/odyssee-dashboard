export interface SmartMoneyWallet {
    wallet: string;
    cluster: "SmartMoney";
    note?: string;
    alphaScore: number;
    performanceScore: number;
    winRate: number;
    socialScore: number;
    follower: number;
    influenceScore: number;
    scoreX: number;
    boosts: string[];
    tokenImpactScore: number;
    xProfile?: string;
    telegram?: string;
    narrative?: string;
}