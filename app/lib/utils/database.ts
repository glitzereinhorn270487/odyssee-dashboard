// app/lib/utils/database.ts

export async function addWalletToDB(wallet: any, category: string) {
  await fetch(`${process.env.BASE_URL}/api/add-wallet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ wallet, category }),
  });

  console.log(`[Database] ${wallet.address} zur Kategorie ${category} hinzugefügt.`);
  return true;
}

export async function removeWalletFromDB(wallet: string, category: string) {
  await fetch(`${process.env.BASE_URL}/api/remove-wallet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ wallet, category }),
  });

  console.log(`[Database] ${wallet} aus ${category} entfernt.`);
  return true;
}
