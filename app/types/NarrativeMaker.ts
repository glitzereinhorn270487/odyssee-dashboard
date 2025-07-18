export interface NarrativeMaker {
  handle: string;
  cluster: "NarrativeMaker";
  xProfile: string;
  telegram?: string;
  scoreX: number;
  boosts: string[];
  follower: number;
  influenceScore: number;
  tokenImpactScore: number;
  reachScore: number;
  narrativeStrength: number;
  knownNarratives: string[];
  tweetExamples?: string[];
  note?: string;
}
