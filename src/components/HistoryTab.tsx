import React, { useState, useEffect } from 'react';
import { Trash2, Star, Search, Download, Sparkles } from 'lucide-react';
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
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Search & Export Toolbar */}
      <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 px-2 py-1 bg-sky-50/50 rounded-2xl border border-sky-100">
            <Search className="h-4 w-4 text-sky-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search scan ledger..."
              className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {items.length > 0 && (
              <>
                <button
                  onClick={exportHistoryCsv}
                  className="flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200/70 hover:-translate-y-0.5 transition-all shadow-xs"
                >
                  <Download className="h-3 w-3 text-sky-500" /> Export CSV
                </button>
                <button onClick={handleClear} className="text-xs text-rose-500 hover:text-rose-700 px-2 font-bold">
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
          {[
            { id: 'all', label: 'All Scans' },
            { id: 'fav', label: 'Starred' },
            { id: 'url', label: 'Links' },
            { id: 'wifi', label: 'Wi-Fi' },
            { id: 'vcard', label: 'Contacts' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-[11px] transition-all duration-200 ${
                activeFilter === f.id
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs scale-105'
                  : 'bg-sky-50/70 text-slate-600 hover:bg-sky-100 hover:text-sky-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Items Ledger */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white border border-sky-100 text-slate-400 text-xs shadow-sm space-y-1">
            <p className="font-semibold text-slate-600">No records found</p>
            <p className="text-[11px] text-slate-400">Scanned QR codes will appear here in real time.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectResult(item)}
              className="group flex items-center justify-between p-4 rounded-3xl bg-white border border-sky-100 hover:border-sky-300 cursor-pointer shadow-sm hover:shadow-md hover:shadow-sky-500/10 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="min-w-0 pr-3 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg uppercase tracking-wider border border-sky-200/60">
                    {item.categoryTitle || item.contentType}
                  </span>
                  <span className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs font-mono text-slate-800 truncate group-hover:text-sky-700 transition-colors">
                  {item.rawValue}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={(e) => handleToggleStar(e, item.id)} className="text-slate-300 hover:text-amber-500 p-1.5 transition-transform hover:scale-125">
                  <Star className={`h-4 w-4 ${item.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
                </button>
                <button
                  onClick={(e) => handleDeleteItem(e, item.id)}
                  className="text-slate-300 hover:text-rose-500 p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  title="Delete Item"
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
