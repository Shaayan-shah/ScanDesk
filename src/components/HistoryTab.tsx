import React, { useState, useEffect } from 'react';
import { History, Trash2, Star, Download, Search } from 'lucide-react';
import { ScanResult } from '../types';
import { StorageService } from '../services/storage';

interface HistoryTabProps {
  onSelectResult: (result: ScanResult) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ onSelectResult }) => {
  const [items, setItems] = useState<ScanResult[]>([]);
  const [query, setQuery] = useState('');

  const loadData = () => setItems(StorageService.getHistory());

  useEffect(() => {
    loadData();
  }, []);

  const handleClear = () => {
    StorageService.clearAll();
    loadData();
  };

  const handleToggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    StorageService.toggleFavorite(id);
    loadData();
  };

  const filtered = items.filter((i) => i.rawValue.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search saved scans..."
          className="w-full bg-transparent text-xs text-white px-2 focus:outline-none placeholder:text-slate-500"
        />
        {items.length > 0 && (
          <button onClick={handleClear} className="text-xs text-rose-400 hover:underline px-2 shrink-0">
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
            No scan history recorded. Items you scan will be saved here offline.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectResult(item)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition"
            >
              <div className="min-w-0 pr-3">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                  {item.categoryTitle || item.contentType}
                </span>
                <p className="text-xs font-mono text-slate-200 truncate">{item.rawValue}</p>
                <span className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleString()}</span>
              </div>
              <button onClick={(e) => handleToggleStar(e, item.id)} className="text-slate-500 hover:text-amber-400">
                <Star className={`h-4 w-4 ${item.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
