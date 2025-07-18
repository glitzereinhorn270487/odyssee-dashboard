export interface ViralXAccount {
    handle: string;
    cluster: "ViralX";
    xProfile: string;
    telegram?: string;
    tweetExamples?: string[];
    scoreX: number;
    boosts: string[];
    reachScore: number;
    socialScore: number;
    tokenImpactScore: number;
    influenceScore: number;
    follower: number;
    performanceScore: number;
    winRate: number;
    narrative?: string;
    note?: string;
}