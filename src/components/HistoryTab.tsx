import React, { useState, useEffect } from 'react';
import { History, Trash2, Star, Search } from 'lucide-react';
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
    if (confirm('Clear all saved scan history?')) {
      StorageService.clearAll();
      loadData();
    }
  };

  const handleToggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    StorageService.toggleFavorite(id);
    loadData();
  };

  const filtered = items.filter((i) => i.rawValue.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 flex-1 px-1">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search saved scans..."
            className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400"
          />
        </div>
        {items.length > 0 && (
          <button onClick={handleClear} className="text-xs text-rose-600 font-semibold hover:underline px-2 shrink-0">
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white border border-slate-200/80 text-slate-500 text-xs shadow-xs">
            No scan records found. Codes you scan will be saved here automatically.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectResult(item)}
              className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/50 cursor-pointer transition shadow-xs"
            >
              <div className="min-w-0 pr-3">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider inline-block mb-1">
                  {item.categoryTitle || item.contentType}
                </span>
                <p className="text-xs font-mono text-slate-800 truncate">{item.rawValue}</p>
                <span className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleString()}</span>
              </div>
              <button onClick={(e) => handleToggleStar(e, item.id)} className="text-slate-300 hover:text-amber-500 p-1">
                <Star className={`h-4 w-4 ${item.isFavorite ? 'text-amber-500 fill-amber-500' : ''}`} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

