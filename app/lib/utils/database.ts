// app/lib/utils/database.ts

export const Database = {
  async addOrUpdate(type: string, wallet: string, data: any) {
    console.log(`[Database] ${wallet} in ${type} gespeichert.`);
    return true;
  },
  async remove(type: string, wallet: string) {
    console.log(`[Database] ${wallet} aus ${type} entfernt.`);
    return true;
  },
  export async function addWalletToDB(wallet: any, category: string) {
  // Beispielhafte Speicherung – passe ggf. für deine Redis-Struktur an
  await fetch(`${process.env.BASE_URL}/api/add-wallet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ wallet, category }),
  });
}

export async function removeWalletFromDB(wallet: string, category: string) {
  // Beispielhafte Entfernung – passe ggf. für deine Redis-Struktur an
  await fetch(`${process.env.BASE_URL}/api/remove-wallet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ wallet, category }),
  });
}

};
