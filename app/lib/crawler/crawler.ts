// app/lib/crawler/crawler.ts
import { ScoreX } from "@/lib/utils/scorex";
import { addWalletToDB, removeWalletFromDB } from "@/lib/utils/database";
import { fetchRecentTransactions } from "@/lib/helius-logic"; // oder dein aktueller Import
import { debounce } from "@/lib/utils/debounce"; // wird unten noch erklärt
import { getMonitoredWallets } from "@/lib/redis";

export async function runCrawler() {
  const wallets = await getMonitoredWallets();

  for (const wallet of wallets) {
    if (!debounce(wallet.address, 60000)) {
      continue; // Frühzeitig überspringen, wenn gebounced
    }

    const txs = []; // Dummy-Leere Liste
    let evaluation = await ScoreX.evaluate(wallet.address, txs);

    if (evaluation.shouldRemove) {
      console.log("[CRAWLER] Entferne Wallet:", wallet.address);
      await addWalletToDB(wallet.address, wallet.cluster);


    } else if (evaluation.shouldUpdate) {
      console.log("[CRAWLER] Füge Wallet hinzu:", wallet.address);
      await addWalletToDB(wallet.address, JSON.stringify(evaluation.newData));

    }
  }
}
