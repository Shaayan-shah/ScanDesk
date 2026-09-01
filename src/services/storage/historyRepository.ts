import { openDB, IDBPDatabase } from "idb";
import { ScanResult } from "../../types";

const DB_NAME = "scandesk_db";
const DB_VERSION = 1;
const STORE_NAME = "history";

export class HistoryRepository {
  private static dbPromise: Promise<IDBPDatabase> | null = null;

  private static getDB(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
            store.createIndex("timestamp", "timestamp", { unique: false });
            store.createIndex("contentType", "contentType", { unique: false });
            store.createIndex("isFavorite", "isFavorite", { unique: false });
          }
        }
      });
    }
    return this.dbPromise;
  }

  static async saveScan(result: ScanResult): Promise<void> {
    const db = await this.getDB();
    await db.put(STORE_NAME, result);
  }

  static async getAllScans(): Promise<ScanResult[]> {
    const db = await this.getDB();
    const all = await db.getAllFromIndex(STORE_NAME, "timestamp");
    return all.reverse(); // Newest first
  }

  static async deleteScan(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete(STORE_NAME, id);
  }

  static async toggleFavorite(id: string): Promise<boolean> {
    const db = await this.getDB();
    const item = (await db.get(STORE_NAME, id)) as ScanResult | undefined;
    if (item) {
      item.isFavorite = !item.isFavorite;
      await db.put(STORE_NAME, item);
      return item.isFavorite;
    }
    return false;
  }

  static async updateNotes(id: string, notes: string): Promise<void> {
    const db = await this.getDB();
    const item = (await db.get(STORE_NAME, id)) as ScanResult | undefined;
    if (item) {
      item.notes = notes;
      await db.put(STORE_NAME, item);
    }
  }

  static async clearAll(): Promise<void> {
    const db = await this.getDB();
    await db.clear(STORE_NAME);
  }
}
