// app/lib/crawler/crawler.ts
import { ScoreX } from "@/lib/utils/scorex";
import { addWalletToDB, removeWalletFromDB } from "@/lib/utils/database";
import { fetchRecentTransactions } from "@/lib/helius-logic"; // oder dein aktueller Import
import { debounce } from "@/lib/utils/debounce"; // wird unten noch erklärt
import { getMonitoredWallets } from "@/lib/redis";

export async function runCrawler() {
  const wallets = await getMonitoredWallets(); // aus Redis oder einer JSON-List
  for (const wallet of wallets) {
    const txs = await fetchRecentTransactions(wallet.address);

    const evaluation = await ScoreX.evaluate(wallet.address, txs);
    if (evaluation.shouldRemove) {
      await removeWalletFromDB(wallet.address, wallet.cluster);
    } else if (evaluation.shouldUpdate) {
      await addWalletToDB(wallet.address, evaluation.newData);
    }
    if (!debounce(wallet.address, 60000)) continue;

  }
}
