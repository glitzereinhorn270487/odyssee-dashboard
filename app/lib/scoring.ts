// app/lib/scoring.ts

// --- 1. TYP-DEFINITIONEN ---

/**
 * Definiert die Rohdaten, die als Input für die Bewertungs-Engine benötigt werden.
 * Diese Daten müssen vor der Bewertung vom trade-engine gesammelt werden.
 */
export interface TokenInputData {
  address: string;
  lpIsLocked: boolean;
  gini: number;
  topHolderShare: number;
  insiderHits: number;
  smartMoneyHits: number;
}

/**
 * Definiert das finale, strukturierte Ergebnis der ScoreX-Bewertung.
 * Dieses Objekt wird an die trade-engine zurückgegeben.
 */
export interface ScoreXResult {
  [x: string]: any;
  finalScore: number;       // Der endgültige, gewichtete Score (0-100)
  baseScore: number;        // Score basierend auf reiner On-Chain-Gesundheit
  boostScore: number;       // Bonuspunkte durch Insider/Smart-Money-Aktivität
  pumpRisk: 'Niedrig' | 'Mittel' | 'Hoch'; // Leicht verständliches Risiko-Label
  riskScore: number;        // Numerischer Malus für das Risiko
  boostReasons: string[];   // Eine Liste der Gründe für den Boost, z.B. ["Insider-Beteiligung"]
}

// --- 2. DIE ZENTRALE SCORING-ENGINE ---

export class ScoreXEngine {
  private data: TokenInputData;

  /**
   * Erstellt eine neue Instanz der ScoreXEngine für einen spezifischen Token.
   * @param tokenData Die gesammelten On-Chain- und Datenbank-Daten für den Token.
   */
  constructor(tokenData: TokenInputData) {
    this.data = tokenData;
  }

  /**
   * Berechnet den Basis-Score (max. 60 Pkt.) basierend auf der grundlegenden On-Chain-Gesundheit.
   * Dies ist das Fundament jeder Bewertung.
   */
  private calculateBaseScore(): number {
    let score = 0;
    if (this.data.lpIsLocked) score += 30;
    if (this.data.gini < 0.90) score += 15;
    if (this.data.topHolderShare < 0.20) score += 15;
    return score;
  }

  /**
   * Berechnet den Boost-Score (max. 30 Pkt.) basierend auf der Qualität der frühen Käufer.
   * Dies identifiziert das "Alpha".
   */
  private calculateBoosts(): { boostScore: number; boostReasons: string[] } {
    let boostScore = 0;
    const boostReasons: string[] = [];

    if (this.data.insiderHits > 0) {
      boostScore = 30; // Höchster Boost für verifizierte Insider
      boostReasons.push("Insider-Beteiligung");
    } else if (this.data.smartMoneyHits > 3) {
      boostScore = 25; // Starker Boost für ein Smart-Money-Cluster
      boostReasons.push("Smart-Money-Cluster");
    } else if (this.data.smartMoneyHits > 0) {
      boostScore = 15; // Normaler Boost für einzelne Smart-Money-Käufer
      boostReasons.push("Smart-Money-Beteiligung");
    }
    
    return { boostScore, boostReasons };
  }

  /**
   * Berechnet das Risiko in Form eines Labels und eines numerischen Malus.
   * Dieser Malus wird vom Gesamtscore abgezogen.
   */
  private calculatePumpRisk(): { pumpRisk: 'Niedrig' | 'Mittel' | 'Hoch'; riskScore: number } {
    if (!this.data.lpIsLocked) {
      return { pumpRisk: 'Hoch', riskScore: 50 }; // Hoher Malus für ungesperrte LP
    }
    if (this.data.gini > 0.95 || this.data.topHolderShare > 0.30) {
      return { pumpRisk: 'Mittel', riskScore: 20 }; // Mittlerer Malus für hohe Konzentration
    }
    return { pumpRisk: 'Niedrig', riskScore: 0 }; // Kein Malus für gesunde Token
  }

  /**
   * Die öffentliche Hauptfunktion, die die gesamte Bewertung orchestriert.
   * @returns Das vollständige ScoreXResult-Objekt.
   */
  public evaluateToken(): ScoreXResult {
    const baseScore = this.calculateBaseScore();
    const { boostScore, boostReasons } = this.calculateBoosts();
    const { pumpRisk, riskScore } = this.calculatePumpRisk();

    // Der finale Score wird berechnet, indem das Risiko vom Potenzial abgezogen wird.
    const finalScore = baseScore + boostScore - riskScore;

    return {
      finalScore: Math.max(0, Math.round(finalScore)), // Stellt sicher, dass der Score nicht negativ wird
      baseScore,
      boostScore,
      pumpRisk,
      riskScore,
      boostReasons,
    };
  }
}