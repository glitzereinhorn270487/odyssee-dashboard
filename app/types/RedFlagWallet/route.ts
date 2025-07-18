export interface RedFlagWallet {
    wallet: string;
    cluster: "RedFlag";
    note?: string;
    rugRate: number;
    winRate: number;
    alphaScore: number;
    influenceScore: number;
    performanceScore: number;
    socialScore: number;
    reachScore: number;
    tokenImpactScore: number;
    follower: number;
    xProfile: string;
    telegram?: string;
    narrrative?: string;
    scoreX: number;
    boosts: string[];
    isBlacklisted: boolean;
}