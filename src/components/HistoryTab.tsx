import React, { useState, useEffect } from 'react';
import { Trash2, Star, Search, Download } from 'lucide-react';
import { ScanResult } from '../types';
import { StorageService } from '../services/storage';

interface HistoryTabProps {
  onSelectResult: (result: ScanResult) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ onSelectResult }) => {
  const [items, setItems] = useState<ScanResult[]>([]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'url' | 'wifi' | 'vcard' | 'fav'>('all');

  const loadData = () => setItems(StorageService.getHistory());

  useEffect(() => {
    loadData();
  }, []);

  const handleClear = () => {
    if (confirm('Clear your scan history?')) {
      StorageService.clearAll();
      loadData();
    }
  };

  const handleToggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    StorageService.toggleFavorite(id);
    loadData();
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    StorageService.deleteScan(id);
    loadData();
  };

  const exportHistoryCsv = () => {
    const headers = 'ID,Type,Format,Timestamp,Payload\n';
    const rows = items
      .map((b) => `"${b.id}","${b.contentType}","${b.format}","${new Date(b.timestamp).toISOString()}","${b.rawValue.replace(/"/g, '""')}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scandesk_history_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = items.filter((item) => {
    const matchesQuery = item.rawValue.toLowerCase().includes(query.toLowerCase());
    if (!matchesQuery) return false;
    if (activeFilter === 'fav') return !!item.isFavorite;
    if (activeFilter === 'url') return item.contentType === 'url';
    if (activeFilter === 'wifi') return item.contentType === 'wifi';
    if (activeFilter === 'vcard') return item.contentType === 'vcard';
    return true;
  });

  return (
    <div className="space-y-3.5 max-w-2xl mx-auto">
      {/* Search & Action Bar */}
      <div className="p-3 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 px-1">
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search scans..."
              className="w-full bg-transparent text-xs text-zinc-800 focus:outline-none placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {items.length > 0 && (
              <>
                <button
                  onClick={exportHistoryCsv}
                  className="flex items-center gap-1 text-[11px] font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200/80 px-2.5 py-1 rounded-lg transition"
                >
                  <Download className="h-3 w-3" /> Export
                </button>
                <button onClick={handleClear} className="text-xs text-zinc-500 hover:text-zinc-900 px-1 font-medium">
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'fav', label: 'Starred' },
            { id: 'url', label: 'Links' },
            { id: 'wifi', label: 'Wi-Fi' },
            { id: 'vcard', label: 'Contacts' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1 rounded-xl font-medium text-[11px] transition ${
                activeFilter === f.id
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white border border-zinc-200/80 text-zinc-400 text-xs shadow-xs">
            No scans found.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectResult(item)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 cursor-pointer transition shadow-xs group"
            >
              <div className="min-w-0 pr-3 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md uppercase">
                    {item.categoryTitle || item.contentType}
                  </span>
                  <span className="text-[10px] text-zinc-400">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs font-mono text-zinc-800 truncate">{item.rawValue}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button onClick={(e) => handleToggleStar(e, item.id)} className="text-zinc-300 hover:text-amber-500 p-1">
                  <Star className={`h-4 w-4 ${item.isFavorite ? 'text-amber-500 fill-amber-500' : ''}`} />
                </button>
                <button
                  onClick={(e) => handleDeleteItem(e, item.id)}
                  className="text-zinc-300 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
