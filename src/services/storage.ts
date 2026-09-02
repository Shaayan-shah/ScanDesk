import { ScanResult } from '../types';

const STORAGE_KEY = 'scandesk_history_v2';

export class StorageService {
  static getHistory(): ScanResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveScan(result: ScanResult): void {
    const list = this.getHistory();
    list.unshift(result);
    if (list.length > 100) list.pop();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }

  static toggleFavorite(id: string): void {
    const list = this.getHistory();
    const item = list.find((i) => i.id === id);
    if (item) {
      item.isFavorite = !item.isFavorite;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  }

  static deleteScan(id: string): void {
    const list = this.getHistory().filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
