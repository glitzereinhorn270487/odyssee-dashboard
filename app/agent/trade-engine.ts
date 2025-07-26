// app/agent/trade-engine.ts

import { Helius } from "helius-sdk";
import redis from "@/lib/redisClient"; 
import { getMonitoredWallets,  getRedisValue, setRedisValue, delRedisKey, getAllKeys } from "@/lib/redis"; 
import { ScoreXEngine, type TokenInputData, type ScoreXResult } from "@/lib/scoring";
import { investmentLevels, getInvestmentLevel } from "@/lib/investment-level";
import { sendTelegramBuyMessage, sendTelegramSellMessage, sendTelegramSystemMessage } from "@/lib/telegram";
import { getTelegramToggles } from "@/config/telegramToggles"; 
import { getBotRunningStatus } from "@/lib/bot-status"; 

// --- HELPER-FUNKTIONEN FÜR DATENABRUF (HELPER) ---
// (findLpAddressForToken, checkLpStatus, getTokenHolders, getGiniCoefficient, getTopHolderShare, getEarlyBuyers bleiben unverändert)

/**
 * Findet die Raydium Liquidity Pool (LP) Adresse für eine gegebene Token-Adresse.
 * @param helius Die Helius-Instanz.
 * @param tokenAddress Die Mint-Adresse des Tokens.
 * @returns Die LP-Adresse als String oder null, falls nicht gefunden.
 */
export async function findLpAddressForToken(helius: Helius, tokenAddress: string): Promise<string | null> {
  try {
    const signaturesResponse: any = await helius.rpc.getSignaturesForAsset({ id: tokenAddress, limit: 20, page: 1 }); 
    
    if (!signaturesResponse || !Array.isArray(signaturesResponse.result)) {
        console.warn(`[findLpAddressForToken] Unerwartete Antwortstruktur für Signaturen von ${tokenAddress}.`);
        return null;
    }

    for (const tx of signaturesResponse.result) { 
      const parsedTxArray = await helius.parseTransactions(tx.signature); 
      
      if (!Array.isArray(parsedTxArray) || parsedTxArray.length === 0) {
          console.warn(`[findLpAddressForToken] Keine geparste Transaktion für Signatur ${tx.signature}.`);
          continue;
      }
      
      const parsedTx = parsedTxArray[0]; 

      const initInstruction = parsedTx.instructions.find((inst: any) => {
        return inst.parsed?.info?.actions?.some((act: any) => act.actionType === "INITIALIZE_POOL");
      });
      if (initInstruction) {
        const lpAddress = initInstruction.accounts.find(acc => acc.startsWith("58o")); 
        if (lpAddress) return lpAddress;
      }
    }
    return null; 
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
    const lpAddress = await findLpAddressForToken(helius, tokenAddress); 

    if (!lpAddress) {
      console.warn(`[ScoreX] Konnte keine LP-Adresse für ${tokenAddress} finden. Status: Unsicher.`);
      return false;
    }

    const lpHistoryResponse: any = await helius.rpc.getSignaturesForAsset({ id: lpAddress, limit: 100, page: 1 }); 
    
    if (!lpHistoryResponse || !Array.isArray(lpHistoryResponse.result)) {
        console.warn(`[checkLpStatus] Unerwartete Antwortstruktur für LP-Historie von ${lpAddress}.`);
        return false;
    }

    for (const tx of lpHistoryResponse.result) { 
      const parsedTxArray = await helius.parseTransactions(tx.signature);
      if (!Array.isArray(parsedTxArray) || parsedTxArray.length === 0) {
          console.warn(`[checkLpStatus] Keine geparste Transaktion für Signatur ${tx.signature}.`);
          continue;
      }
      const parsedTx = parsedTxArray[0]; 

      for (const instruction of parsedTx.instructions) { 
        if ((instruction as any).parsed?.info?.actions?.some((action: any) => 
            action.actionType === "BURN" || 
            (action.actionType === "TRANSFER" && (action as any).to === "11111111111111111111111111111111") 
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
    const response: any = await helius.rpc.getTokenAccounts({ mint: tokenAddress }); 
    
    if (response && Array.isArray(response.value)) { 
      return response.value.map((account: any) => ({ 
        balance: account.uiAmount ?? 0,
        owner: account.address,
      }));
    } else if (response && Array.isArray(response.accounts)) { 
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

export async function getEarlyBuyers(helius: Helius, tokenAddress: string): Promise<string[]> {
  console.log(`[ScoreX] Simuliere Abruf der ersten Käufer für: ${tokenAddress}`);
  return [
    "DummyInsiderWallet123", 
    "DummySmartMoneyWallet456", 
    "RandomWallet789_A",
    "RandomWallet789_B",
    "RandomWallet789_C",
    "DummySmartMoneyWallet456", 
  ];
}


// --- PAPER TRADE SIMULATION & KAPITALVERWALTUNG ---

const VIRTUAL_CAPITAL_KEY = 'agent:virtual:capital'; 

/**
 * Initialisiert das virtuelle Kapital des Agenten, falls es noch nicht existiert.
 * @param initialAmount Das Startkapital für den Paper Trade.
 */
export async function initializeVirtualCapital(initialAmount: number = 1000): Promise<void> {
  console.log(`[PaperTrade] Initialisiere virtuelles Kapital mit ${initialAmount}$...`); // NEUER LOG
  const currentCapital = await getRedisValue<number>(VIRTUAL_CAPITAL_KEY); 
  if (currentCapital === null) { 
    await setRedisValue(VIRTUAL_CAPITAL_KEY, initialAmount); 
    console.log(`[PaperTrade] Virtuelles Startkapital auf ${initialAmount}$ gesetzt.`);
  } else {
    console.log(`[PaperTrade] Virtuelles Kapital bereits vorhanden: ${currentCapital}$`);
  }
}

/**
 * Ruft das aktuelle virtuelle Kapital ab.
 */
export async function getVirtualCapital(): Promise<number> { // <-- 'export' hinzugefügt
  const capital = await getRedisValue<number>(VIRTUAL_CAPITAL_KEY); 
  console.log(`[PaperTrade] Aktuelles virtuelles Kapital aus Redis gelesen: ${capital ?? 0}$`); 
  return capital ?? 0; 
}

/**
 * Aktualisiert das virtuelle Kapital.
 */
export async function updateVirtualCapital(amount: number): Promise<void> { 
  const currentCapital = await getVirtualCapital();
  await setRedisValue(VIRTUAL_CAPITAL_KEY, currentCapital + amount); 
  console.log(`[PaperTrade] Kapital aktualisiert: Von ${currentCapital}$ auf ${currentCapital + amount}$`);
}

// --- HAUPTFUNKTION DER TRADE ENGINE ---

/**
 * Dies ist die zentrale Hauptfunktion, die den gesamten Prozess für einen Token orchestriert.
 * @param token Das Basis-Token-Objekt (Adresse, Symbol etc.)
 * @returns Das vollständige ScoreXResult-Objekt oder null, wenn der Bot gestoppt ist oder ein Fehler auftritt.
 */
export async function decideTrade(token: { address: string; symbol: string; name: string }): Promise<ScoreXResult | null> {
  const botRunning = await getBotRunningStatus();
  if (!botRunning) {
    console.log("[TradeEngine] Bot ist gestoppt. Überspringe Trade-Entscheidung.");
    return null;
  }

  const telegramToggles = await getTelegramToggles(); 

  try {
    const helius = new Helius(process.env.HELIUS_API_KEY!); 
    
    const [lpIsLocked, gini, topHolderShare, earlyBuyers, insiderWallets, ] = await Promise.all([
      checkLpStatus(helius, token.address),
      getGiniCoefficient(helius, token.address),
      getTopHolderShare(helius, token.address),
      getEarlyBuyers(helius, token.address),
      getMonitoredWallets(), 
      smartMoneyWallets(), 
    ]);

    const insiderHits = earlyBuyers.filter((buyer: any) => insiderWallets.includes(buyer)).length;
    const smartMoneyHits = earlyBuyers.filter((buyer: any) => smartMoneyWallets.length);

    const tokenData: TokenInputData = {
      address: token.address,
      lpIsLocked,
      gini,
      topHolderShare,
      insiderHits,
      smartMoneyHits: 0
    };

    const scoringEngine = new ScoreXEngine(tokenData);
    const scoreResult = scoringEngine.evaluateToken();

    console.log(`[TradeEngine] Finale Bewertung für ${token.symbol}:`, scoreResult);

    const currentVirtualCapital = await getVirtualCapital();
    const currentInvestmentLevelKey = getInvestmentLevel(currentVirtualCapital);
    const levelConfig = investmentLevels[currentInvestmentLevelKey];

    if (levelConfig.minLiquidity && 1000 /* Dummy-Liquidität */ < levelConfig.minLiquidity) {
      console.log(`[TradeEngine] Kein Kauf für ${token.symbol}: Liquidität (${1000}$) zu gering für Stufe ${currentInvestmentLevelKey} (min: ${levelConfig.minLiquidity}$).`);
      return null;
    }

    let shouldBuy = false;
    if (scoreResult.finalScore >= levelConfig.minScore) {
      shouldBuy = true;
    }

    const investmentAmount = levelConfig.maxInvestment;

    if (currentVirtualCapital < investmentAmount) {
      console.warn(`[PaperTrade] Nicht genug Kapital (${currentVirtualCapital}$) für Investition von ${investmentAmount}$ in ${token.symbol}.`);
      shouldBuy = false; 
    }

    if (shouldBuy) {
      const simulatedEntryPrice = (Math.random() * 0.1 + 1) * 0.0001; 

      await updateVirtualCapital(-investmentAmount);

      if (telegramToggles.global && telegramToggles.tradeSignals) {
        await sendTelegramBuyMessage({
          address: token.address,
          symbol: token.symbol,
          scoreX: scoreResult.finalScore,
          fomoScore: scoreResult.pumpRisk, 
          pumpRisk: scoreResult.pumpRisk,
        });
      }

      await setRedisValue(`position:${token.address}`, {
        tradeId: `trade-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, 
        address: token.address,
        symbol: token.symbol,
        initialInvestmentUsd: investmentAmount, 
        entryPrice: simulatedEntryPrice, 
        currentValueUsd: investmentAmount, 
        pnlPercentage: 0, 
        strategy: currentInvestmentLevelKey, 
        scoreX: scoreResult.finalScore,
        boostReasons: scoreResult.boostReasons,
        timestamp: Date.now(), 
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
  const botRunning = await getBotRunningStatus();
  if (!botRunning) {
    console.log("[PaperTrade-Sell] Bot ist gestoppt. Überspringe Verkaufsprozess.");
    return;
  }

  const telegramToggles = await getTelegramToggles();

  try {
    const helius = new Helius(process.env.HELIUS_API_KEY!); 

    const positionKeys = await getAllKeys('position:*'); 
    if (positionKeys.length === 0) {
      console.log("[PaperTrade-Sell] Keine offenen Positionen zu prüfen.");
      return;
    }

    console.log(`[PaperTrade-Sell] Prüfe ${positionKeys.length} offene Position(en)...`);

    for (const key of positionKeys) {
      const position = await getRedisValue<any>(key); 
      if (!position || !position.entryPrice) continue;

      const tokenAddress = position.address;
      const tokenSymbol = position.symbol;

      const currentPrice = await getRedisValue<number>(`liveprice:${tokenAddress}`) || (Math.random() * 0.5 + 0.00005); 
      
      const pnlPercentage = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
      const currentValueUsd = position.initialInvestmentUsd * (1 + (pnlPercentage / 100));

      await setRedisValue(key, { 
        ...position,
        currentValueUsd: currentValueUsd,
        pnlPercentage: pnlPercentage,
      });

      let shouldSell = false;
      let reason = "N/A";
      let profitAmount = 0; 

      if (pnlPercentage >= 100 && position.initialInvestmentUsd > 0) { 
        shouldSell = true;
        reason = "Teilgewinn bei 2x erreicht";
        profitAmount = position.initialInvestmentUsd * 0.5; 
        console.log(`[PaperTrade-Sell] Teilverkauf von ${tokenSymbol}: ${reason}. Gewinn: ${profitAmount}$.`);
      }
      
      if (pnlPercentage <= -30) { 
        shouldSell = true;
        reason = "Stop-Loss erreicht (-30%)";
        profitAmount = -position.initialInvestmentUsd * 0.3; 
        console.log(`[PaperTrade-Sell] Stop-Loss für ${tokenSymbol}: ${reason}. Verlust: ${profitAmount}$.`);
      }

      if (shouldSell) {
        await updateVirtualCapital(profitAmount); 

        if (telegramToggles.global && telegramToggles.tradeSignals) { 
          await sendTelegramSellMessage({
            address: tokenAddress,
            symbol: tokenSymbol,
            scoreX: position.scoreX,
            fomoScore: position.fomoScore,
            pumpRisk: position.pumpRisk,
            reason: reason,
            profit: pnlPercentage, 
          });
        }

        await delRedisKey(key); 
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
function smartMoneyWallets(): any {
  throw new Error("Function not implemented.");
}

