// app/agent/trade-engine.ts

import { Helius } from "helius-sdk";
import redis from "@/lib/redisClient"; // Sicherstellen, dass der Redis-Client korrekt importiert wird
import { getMonitoredWallets, getSmartMoneyWallets, getRedisValue, setRedisValue, delRedisKey, getAllKeys } from "@/lib/redis"; // Alle benötigten Redis-Helper importieren
import { ScoreXEngine, type TokenInputData, type ScoreXResult } from "@/lib/scoring";
import { investmentLevels, getInvestmentLevel } from "@/lib/investment-level";
import { sendTelegramBuyMessage, sendTelegramSellMessage, sendTelegramSystemMessage } from "@/lib/telegram";
import { getTelegramToggles } from "@/config/telegramToggles"; // Importiere die Funktion zum Abrufen der Toggles
import { getBotRunningStatus } from "@/lib/bot-status"; // Importiere Funktion zum Abrufen des Bot-Status

// --- HELPER-FUNKTIONEN FÜR DATENABRUF (HELPER) ---

/**
 * Findet die Raydium Liquidity Pool (LP) Adresse für eine gegebene Token-Adresse.
 * @param helius Die Helius-Instanz.
 * @param tokenAddress Die Mint-Adresse des Tokens.
 * @returns Die LP-Adresse als String oder null, falls nicht gefunden.
 */
export async function findLpAddressForToken(helius: Helius, tokenAddress: string): Promise<string | null> {
  try {
    // KORREKTUR: Verwende getSignaturesForAsset mit 'id', da der Compiler darauf besteht.
    const signaturesResponse: any = await helius.rpc.getSignaturesForAsset({ id: tokenAddress, limit: 20, page: 1 }); 
    
    if (!signaturesResponse || !Array.isArray(signaturesResponse.result)) {
        console.warn(`[findLpAddressForToken] Unerwartete Antwortstruktur für Signaturen von ${tokenAddress}.`);
        return null;
    }

    for (const tx of signaturesResponse.result) { // Iteriere direkt über signaturesResponse.result
      // KORREKTUR: helius.parseTransactions erwartet direkt den Signatur-String oder ein Array von Strings
      // und gibt ein Array von geparsten Transaktionen zurück.
      const parsedTxArray = await helius.parseTransactions(tx.signature); 
      
      if (!Array.isArray(parsedTxArray) || parsedTxArray.length === 0) {
          console.warn(`[findLpAddressForToken] Keine geparste Transaktion für Signatur ${tx.signature}.`);
          continue;
      }
      
      const parsedTx = parsedTxArray[0]; // Greife auf das erste geparste Transaktionsobjekt zu

      // KORREKTUR: Zugriff auf Aktionen innerhalb der geparsten Instruktion.
      const initInstruction = parsedTx.instructions.find((inst: any) => {
        return inst.parsed?.info?.actions?.some((act: any) => act.actionType === "INITIALIZE_POOL");
      });
      if (initInstruction) {
        const lpAddress = initInstruction.accounts.find(acc => acc.startsWith("58o")); // Raydium LPv4-Kennung
        if (lpAddress) return lpAddress;
      }
    }
    return null; // Wenn die Schleife durchläuft und kein LP gefunden wird
  } catch (error) {
    console.error(`[ScoreX-ERROR] Konnte LP-Adresse für ${tokenAddress} nicht finden:`, error);
    return null;
  }
}

/**
 * Prüft, ob die Liquidität eines Tokens gesperrt oder verbrannt wurde.
 * @param helius Die Helius-Instanz.
 * @param tokenAddress Die Mint-Adresse des Tokens.
 * @returns 'true', wenn die LP als sicher eingestuft wird, sonst 'false'.
 */
export async function checkLpStatus(helius: Helius, tokenAddress: string): Promise<boolean> {
  console.log(`[ScoreX] Prüfe LP-Status für: ${tokenAddress}`);
  try {
    const lpAddress = await findLpAddressForToken(helius, tokenAddress); // lpAddress ist hier korrekt definiert

    if (!lpAddress) {
      console.warn(`[ScoreX] Konnte keine LP-Adresse für ${tokenAddress} finden. Status: Unsicher.`);
      return false;
    }

    // KORREKTUR: Verwende getSignaturesForAsset mit 'id', da der Compiler darauf besteht.
    const lpHistoryResponse: any = await helius.rpc.getSignaturesForAsset({ id: lpAddress, limit: 100, page: 1 }); 
    
    if (!lpHistoryResponse || !Array.isArray(lpHistoryResponse.result)) {
        console.warn(`[checkLpStatus] Unerwartete Antwortstruktur für LP-Historie von ${lpAddress}.`);
        return false;
    }

    for (const tx of lpHistoryResponse.result) { // Iteriere direkt über rawLPHistoryResponse.result
      // KORREKTUR: helius.parseTransactions erwartet direkt den Signatur-String
      const parsedTxArray = await helius.parseTransactions(tx.signature);
      if (!Array.isArray(parsedTxArray) || parsedTxArray.length === 0) {
          console.warn(`[checkLpStatus] Keine geparste Transaktion für Signatur ${tx.signature}.`);
          continue;
      }
      const parsedTx = parsedTxArray[0]; // Greife auf das erste geparste Transaktionsobjekt zu

      for (const instruction of parsedTx.instructions) { // instructions Property existiert auf parsedTx
        // KORREKTUR: Zugriff auf Aktionen innerhalb der geparsten Instruktion.
        if ((instruction as any).parsed?.info?.actions?.some((action: any) => 
            action.actionType === "BURN" || 
            (action.actionType === "TRANSFER" && (action as any).to === "11111111111111111111111111111111") // Solana Black Hole Adresse
        )) {
          console.log(`[ScoreX] LP für ${tokenAddress} wurde verbrannt/gesperrt. Status: Sicher.`);
          return true;
        }
      }
    }
    console.warn(`[ScoreX] Kein Burn/Lock für LP von ${tokenAddress} gefunden. Status: Unsicher.`);
    return false;
  } catch (error) {
    console.error(`[ScoreX-ERROR] Fehler beim Prüfen des LP-Status für ${tokenAddress}:`, error);
    return false;
  }
}

/**
 * Holt die Top-Halter eines Tokens von der Helius RPC.
 * @param helius Die Helius-Instanz.
 * @param tokenAddress Die Mint-Adresse des Tokens.
 * @returns Ein Array von Objekten mit der Balance und der Adresse des Besitzers.
 */
export async function getTokenHolders(helius: Helius, tokenAddress: string): Promise<{ balance: number; owner: string }[]> {
  try {
    // KORREKTUR: getTokenAccounts ist die korrekte Methode für Token-Konten.
    // Sie erwartet ein Objekt mit 'owner' (für Wallet-Konten) oder 'mint' (für Token-Konten).
    // Hier verwenden wir 'mint' um alle Halter des Tokens zu bekommen.
    const response: any = await helius.rpc.getTokenAccounts({ mint: tokenAddress }); 
    
    // Die Antwortstruktur kann variieren. Oft sind die Daten direkt im 'items' oder 'accounts' Feld.
    // Wir prüfen auf 'value' wie in der alten Version, oder 'accounts'/'items'
    if (response && Array.isArray(response.value)) { // Helius RPC responses often have a 'value' array
      return response.value.map((account: any) => ({ // Cast account zu any für sicheren Zugriff
        balance: account.uiAmount ?? 0,
        owner: account.address,
      }));
    } else if (response && Array.isArray(response.accounts)) { // Alternative Struktur
      return response.accounts.map((account: any) => ({
        balance: account.uiAmount ?? 0,
        owner: account.address,
      }));
    }
    console.warn(`[getTokenHolders] Unerwartete Antwortstruktur für Token-Halter ${tokenAddress}. Antwort:`, response);
    return [];
  } catch (error) {
    console.error(`[ScoreX-ERROR] Fehler beim Holen der Holder für ${tokenAddress}:`, error);
    return [];
  }
}

// --- BERECHNUNGSFUNKTIONEN ---

export async function getGiniCoefficient(helius: Helius, tokenAddress: string): Promise<number> {
  const holders = await getTokenHolders(helius, tokenAddress);
  if (holders.length < 2) return 1.0;

  const totalTokens = holders.reduce((sum, holder) => sum + holder.balance, 0);
  if (totalTokens === 0) return 1.0;

  holders.sort((a, b) => a.balance - b.balance);

  let numerator = 0;
  holders.forEach((holder, index) => {
    numerator += (index + 1) * holder.balance;
  });

  const gini = (2 * numerator) / (holders.length * totalTokens) - (holders.length + 1) / holders.length;
  return parseFloat(gini.toFixed(4));
}

export async function getTopHolderShare(helius: Helius, tokenAddress: string): Promise<number> {
  const holders = await getTokenHolders(helius, tokenAddress);
  if (holders.length === 0) return 1.0;

  const totalTokens = holders.reduce((sum, holder) => sum + holder.balance, 0);
  if (totalTokens === 0) return 1.0;

  holders.sort((a, b) => b.balance - a.balance);
  const top10Balance = holders.slice(0, 10).reduce((sum, holder) => sum + holder.balance, 0);

  return parseFloat((top10Balance / totalTokens).toFixed(4));
}

/**
 * Holt die Adressen der ersten ~100 Käufer eines Tokens.
 * Für V1 simulieren wir dies. Im Vollausbau wird dies mit Helius-APIs implementiert.
 */
export async function getEarlyBuyers(helius: Helius, tokenAddress: string): Promise<string[]> {
  console.log(`[ScoreX] Simuliere Abruf der ersten Käufer für: ${tokenAddress}`);
  // --- ACHTUNG: Dummy-Daten für Paper Trade! ---
  // Diese müssen später durch echte Parsing-Logik aus Transaktionen ersetzt werden.
  return [
    "DummyInsiderWallet123", // Dummy Insider Wallet
    "DummySmartMoneyWallet456", // Dummy Smart Money Wallet
    "RandomWallet789_A",
    "RandomWallet789_B",
    "RandomWallet789_C",
    "DummySmartMoneyWallet456", // Zweiter Treffer für Smart Money
  ];
}


// --- PAPER TRADE SIMULATION & KAPITALVERWALTUNG ---

const VIRTUAL_CAPITAL_KEY = 'agent:virtual:capital'; // Schlüssel für das virtuelle Kapital in Redis

/**
 * Initialisiert das virtuelle Kapital des Agenten, falls es noch nicht existiert.
 * @param initialAmount Das Startkapital für den Paper Trade.
 */
export async function initializeVirtualCapital(initialAmount: number = 1000): Promise<void> {
  const currentCapital = await getRedisValue<number>(VIRTUAL_CAPITAL_KEY); // getRedisValue verwenden
  if (currentCapital === null) { // Prüfe, ob der Schlüssel nicht existiert
    await setRedisValue(VIRTUAL_CAPITAL_KEY, initialAmount); // setRedisValue verwenden
    console.log(`[PaperTrade] Virtuelles Startkapital auf ${initialAmount}$ gesetzt.`);
  } else {
    console.log(`[PaperTrade] Virtuelles Kapital bereits vorhanden: ${currentCapital}$`);
  }
}

/**
 * Ruft das aktuelle virtuelle Kapital ab.
 */
async function getVirtualCapital(): Promise<number> {
  const capital = await getRedisValue<number>(VIRTUAL_CAPITAL_KEY); // getRedisValue verwenden
  return capital ?? 0; // Rückgabe 0, falls nicht gesetzt
}

/**
 * Aktualisiert das virtuelle Kapital.
 */
async function updateVirtualCapital(amount: number): Promise<void> {
  const currentCapital = await getVirtualCapital();
  await setRedisValue(VIRTUAL_CAPITAL_KEY, currentCapital + amount); // setRedisValue verwenden
  console.log(`[PaperTrade] Kapital aktualisiert: Von ${currentCapital}$ auf ${currentCapital + amount}$`);
}

// --- HAUPTFUNKTION DER TRADE ENGINE ---

/**
 * Dies ist die zentrale Hauptfunktion, die den gesamten Prozess für einen Token orchestriert.
 * @param token Das Basis-Token-Objekt (Adresse, Symbol etc.)
 * @returns Das vollständige ScoreXResult-Objekt oder null, wenn der Bot gestoppt ist oder ein Fehler auftritt.
 */
export async function decideTrade(token: { address: string; symbol: string; name: string }): Promise<ScoreXResult | null> {
  // Prüfe zuerst, ob der Bot überhaupt laufen soll
  const botRunning = await getBotRunningStatus();
  if (!botRunning) {
    console.log("[TradeEngine] Bot ist gestoppt. Überspringe Trade-Entscheidung.");
    return null;
  }

  // KORREKTUR: telegramToggles MUSS HIER VOR DEM TRY-BLOCK ABGERUFEN WERDEN
  const telegramToggles = await getTelegramToggles(); // Aktuelle Telegram-Toggles abrufen

  try {
    const helius = new Helius(process.env.HELIUS_API_KEY!); // Helius-Instanz einmalig erstellen
    
    // 1. Daten SAMMELN (parallel für maximale Geschwindigkeit)
    const [lpIsLocked, gini, topHolderShare, earlyBuyers, insiderWallets, smartMoneyWallets] = await Promise.all([
      checkLpStatus(helius, token.address),
      getGiniCoefficient(helius, token.address),
      getTopHolderShare(helius, token.address),
      getEarlyBuyers(helius, token.address),
      getMonitoredWallets(), // Holt Insider-Wallets aus Redis
      getSmartMoneyWallets(), // Holt SmartMoney-Wallets aus Redis
    ]);

    const insiderHits = earlyBuyers.filter(buyer => insiderWallets.includes(buyer)).length;
    const smartMoneyHits = earlyBuyers.filter(buyer => smartMoneyWallets.includes(buyer)).length;

    const tokenData: TokenInputData = {
      address: token.address,
      lpIsLocked,
      gini,
      topHolderShare,
      insiderHits,
      smartMoneyHits,
    };

    // 2. Token BEWERTEN
    const scoringEngine = new ScoreXEngine(tokenData);
    const scoreResult = scoringEngine.evaluateToken();

    console.log(`[TradeEngine] Finale Bewertung für ${token.symbol}:`, scoreResult);

    // 3. Kaufentscheidung basierend auf ScoreX und Investment-Level
    const currentVirtualCapital = await getVirtualCapital();
    const currentInvestmentLevelKey = getInvestmentLevel(currentVirtualCapital);
    const levelConfig = investmentLevels[currentInvestmentLevelKey];

    // Prüfe, ob die Mindestliquidität für höhere Stufen erreicht ist
    // TODO: Implementiere eine Funktion, die die aktuelle Liquidität des Pools holt
    if (levelConfig.minLiquidity && 1000 /* Dummy-Liquidität */ < levelConfig.minLiquidity) {
      console.log(`[TradeEngine] Kein Kauf für ${token.symbol}: Liquidität (${1000}$) zu gering für Stufe ${currentInvestmentLevelKey} (min: ${levelConfig.minLiquidity}$).`);
      return null;
    }

    let shouldBuy = false;
    if (scoreResult.finalScore >= levelConfig.minScore) {
      shouldBuy = true;
    }

    // Ermittle den Investmentbetrag basierend auf der aktuellen Stufe
    const investmentAmount = levelConfig.maxInvestment;

    // Überprüfe, ob genügend Kapital vorhanden ist
    if (currentVirtualCapital < investmentAmount) {
      console.warn(`[PaperTrade] Nicht genug Kapital (${currentVirtualCapital}$) für Investition von ${investmentAmount}$ in ${token.symbol}.`);
      shouldBuy = false; // Kann nicht kaufen, wenn nicht genug Kapital
    }


    // Wenn entschieden wird zu kaufen, simuliere den Kauf, sende Telegram Nachricht und speichere Position
    if (shouldBuy) {
      // Simulieren eines Einstandspreises (z.B. aktueller Preis + leichte Slippage)
      // TODO: Realistischeren Preis von einer DEX-API holen
      const simulatedEntryPrice = (Math.random() * 0.1 + 1) * 0.0001; // Dummy Preis

      // Ziehe das Investment vom virtuellen Kapital ab
      await updateVirtualCapital(-investmentAmount);

      if (telegramToggles.global && telegramToggles.tradeSignals) {
        await sendTelegramBuyMessage({
          address: token.address,
          symbol: token.symbol,
          scoreX: scoreResult.finalScore,
          fomoScore: scoreResult.pumpRisk, // Temporär: fomoScore aus pumpRisk
          pumpRisk: scoreResult.pumpRisk,
        });
      }

      // Speichern der offenen Position
      await setRedisValue(`position:${token.address}`, {
        tradeId: `trade-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, // Eindeutige ID
        address: token.address,
        symbol: token.symbol,
        initialInvestmentUsd: investmentAmount, // Der investierte Betrag
        entryPrice: simulatedEntryPrice, // Der simulierte Einstandspreis
        currentValueUsd: investmentAmount, // Initial ist aktueller Wert = investierter Betrag
        pnlPercentage: 0, // Initial 0%
        strategy: currentInvestmentLevelKey, // Die Investment-Stufe als Strategie
        scoreX: scoreResult.finalScore,
        boostReasons: scoreResult.boostReasons,
        timestamp: Date.now(), // Zeitpunkt des Kaufs
      });
      console.log(`[PaperTrade] Simulierter KAUF für ${token.symbol} (Score: ${scoreResult.finalScore}, Invest: ${investmentAmount}$), Kapital verbleibend: ${await getVirtualCapital()}$.`);
    }

    return scoreResult;

  } catch (error: any) {
    console.error(`[TradeEngine] Kritischer Fehler bei der Bewertung von ${token.symbol}:`, error);
    if (telegramToggles.global && telegramToggles.errors) {
        await sendTelegramSystemMessage({
            symbol: `Fehler bei Token-Bewertung`,
            message: `Kritischer Fehler bei der Bewertung von ${token.symbol}: ${error.message || error}`,
            isError: true,
        });
    }
    return null;
  }
}

// --- VERKAUFSLOGIK ---
/**
 * Prüft offene Positionen und simuliert Verkäufe basierend auf Preisentwicklung und Regeln.
 * Dieser Cronjob sollte regelmäßig ausgeführt werden.
 */
export async function checkForSell(): Promise<void> {
  // Auch hier prüfen, ob der Bot läuft
  const botRunning = await getBotRunningStatus();
  if (!botRunning) {
    console.log("[PaperTrade-Sell] Bot ist gestoppt. Überspringe Verkaufsprozess.");
    return;
  }

  const telegramToggles = await getTelegramToggles();

  try {
    const helius = new Helius(process.env.HELIUS_API_KEY!); // Helius-Instanz für aktuelle Preise

    // Alle offenen Positionen abrufen
    const positionKeys = await getAllKeys('position:*'); // getAllKeys verwenden
    if (positionKeys.length === 0) {
      console.log("[PaperTrade-Sell] Keine offenen Positionen zu prüfen.");
      return;
    }

    console.log(`[PaperTrade-Sell] Prüfe ${positionKeys.length} offene Position(en)...`);

    for (const key of positionKeys) {
      const position = await getRedisValue<any>(key); // getRedisValue verwenden
      if (!position || !position.entryPrice) continue;

      const tokenAddress = position.address;
      const tokenSymbol = position.symbol;

      // 1. Aktuellen Live-Preis abrufen (simuliert oder real, je nach `getLivePrice`)
      // Aktuell nutzt `getLivePrice` in `price-manager` eine Zufallsfunktion.
      // Für den Paper Trade ist das OK. Für Echtgeld muss es ein realer Preis sein.
      // TODO: Realen Preis von einer DEX-API holen
      const currentPrice = await getRedisValue<number>(`liveprice:${tokenAddress}`) || (Math.random() * 0.5 + 0.00005); // Dummy-Preis, wenn kein Live-Preis vorhanden
      
      // Berechne den aktuellen PnL (simuliert)
      const pnlPercentage = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
      const currentValueUsd = position.initialInvestmentUsd * (1 + (pnlPercentage / 100));

      // Aktualisiere die Position im Dashboard (wird live vom Frontend abgerufen)
      // Wir aktualisieren die Position in Redis, damit das Dashboard die aktuellen Werte anzeigt
      await setRedisValue(key, { // setRedisValue verwenden
        ...position,
        currentValueUsd: currentValueUsd,
        pnlPercentage: pnlPercentage,
      });

      // 2. Verkaufspolicen prüfen
      // Hier müssen deine Verkaufspolicen aus `policy-decision.ts` oder `sell-logic.ts` angewendet werden.
      // Für den Paper Trade können wir eine vereinfachte Logik verwenden:
      // - Standard-Teilgewinn bei 2x (100% Gewinn)
      // - Let Winners Run (z.B. 68% Trailing Stop, wie besprochen)
      // - Fester Stop-Loss (z.B. -30%)

      let shouldSell = false;
      let reason = "N/A";
      let profitAmount = 0; // Betrag, der dem Kapital hinzugefügt wird

      // Beispiel: Schneller Teilverkauf bei 2x
      if (pnlPercentage >= 100 && position.initialInvestmentUsd > 0) { // 2x Gewinn
        shouldSell = true;
        reason = "Teilgewinn bei 2x erreicht";
        profitAmount = position.initialInvestmentUsd * 0.5; // Verkaufe 50% des initialen Investments
        console.log(`[PaperTrade-Sell] Teilverkauf von ${tokenSymbol}: ${reason}. Gewinn: ${profitAmount}$.`);
      }
      
      // Beispiel: Let Winners Run (vereinfacht, hier nur Schwellwert als Beispiel)
      // Du müsstest den Peak-Preis speichern und dann den Trailing Stop berechnen
      // if (pnlPercentage >= 500) { // Beispiel: Nach 5x, "Let Winners Run" wird aktiv
      //   shouldSell = true; // Simuliere Verkauf für diesen Test
      //   reason = "Let Winners Run (5x erreicht, simulierter Exit)";
      //   profitAmount = currentValueUsd; // Verkaufe die gesamte Position
      // }

      // Beispiel: Fester Stop-Loss
      if (pnlPercentage <= -30) { // 30% Verlust
        shouldSell = true;
        reason = "Stop-Loss erreicht (-30%)";
        profitAmount = -position.initialInvestmentUsd * 0.3; // Verluste abziehen
        console.log(`[PaperTrade-Sell] Stop-Loss für ${tokenSymbol}: ${reason}. Verlust: ${profitAmount}$.`);
      }

      if (shouldSell) {
        // Kapital aktualisieren
        await updateVirtualCapital(profitAmount); // Gewinn/Verlust zum Kapital addieren

        // Telegram-Nachricht senden
        if (telegramToggles.global && telegramToggles.tradeSignals) { // Annahme: Verkaufssignale sind Teil der Trade Signals
          await sendTelegramSellMessage({
            address: tokenAddress,
            symbol: tokenSymbol,
            scoreX: position.scoreX,
            fomoScore: position.fomoScore,
            pumpRisk: position.pumpRisk,
            reason: reason,
            profit: pnlPercentage, // Sende den gesamten PnL der Position
          });
        }

        // Position aus Redis entfernen (ist jetzt "geschlossen")
        await delRedisKey(key); // delRedisKey verwenden
        console.log(`[PaperTrade-Sell] Position für ${tokenSymbol} geschlossen. Neues Kapital: ${await getVirtualCapital()}$.`);
      }
    }
  } catch (error: any) {
    console.error("[PaperTrade-Sell] Fehler beim Prüfen auf Verkäufe:", error);
    if (telegramToggles.global && telegramToggles.errors) {
        await sendTelegramSystemMessage({
            symbol: `Fehler beim Verkauf-Check`,
            message: `Ein Fehler ist beim Prüfen auf Verkäufe aufgetreten: ${error.message || error}`,
            isError: true,
        });
    }
  }
}
