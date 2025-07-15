// Datei: lib/utils/validateNewChain.ts

export interface ChainAnalysis {
  name: string;
  hasStandardizedContracts: boolean;
  supportedDEXs: string[];
  memeMarketActive: boolean;
  influencerImpactSimilar: boolean;
  contractDataAvailable: boolean;
  dailyTokenLaunches: number;
  hasWalletAPIs: boolean;
  knownAnomalies: string[];
}

export function validateNewChain(chain: ChainAnalysis): string[] {
  const recommendations: string[] = [];

  // 1. Contractstruktur
  if (!chain.hasStandardizedContracts) {
    recommendations.push("⚠️ Contracts nicht standardisiert – ScoreX OnChain-Logik anpassen oder deaktivieren.");
  }

  // 2. Tradingplattformen
  if (chain.supportedDEXs.length === 0) {
    recommendations.push("⚠️ Keine unterstützten DEXs erkannt – Analysemodul pausieren.");
  }

  // 3. Meme-Market-Kultur
  if (!chain.memeMarketActive) {
    recommendations.push("🚫 Kein Memecoin-Markt – Moonshot-/Babytoken-Kategorien deaktivieren.");
  }

  // 4. Tweet-Wirkung
  if (!chain.influencerImpactSimilar) {
    recommendations.push("⚠️ Geringe Tweet-Wirkung – Viral X & Narrative Maker aussetzen.");
  }

  // 5. Contractdaten
  if (!chain.contractDataAvailable) {
    recommendations.push("⚠️ Keine Contract-Daten – Sicherheitsanalyse & RiskScore deaktivieren oder ersetzen.");
  }

  // 6. Launch-Frequenz
  if (chain.dailyTokenLaunches < 5) {
    recommendations.push("ℹ️ Geringe Token-Frequenz – Crawler nur 1x täglich starten.");
  }

  // 7. On-Chain-Datenqualität
  if (!chain.hasWalletAPIs) {
    recommendations.push("⚠️ Keine Wallet-APIs – keine SmartMoney/Insider/Redflag-Kategorisierung möglich.");
  }

  // 8. Besonderheiten
  if (chain.knownAnomalies.length > 0) {
    recommendations.push("🔍 Spezialverhalten erkannt: " + chain.knownAnomalies.join(", "));
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ Diese Chain ist vollständig kompatibel. Alle Kategorien aktivierbar.");
  }

  return recommendations;
}
