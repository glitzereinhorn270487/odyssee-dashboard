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
};
