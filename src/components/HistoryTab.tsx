import React, { useState, useEffect } from 'react';
import { History, Trash2, Star, Search, Download, Filter, FileText } from 'lucide-react';
import { ScanResult } from '../types';
import { StorageService } from '../services/storage';

interface HistoryTabProps {
  onSelectResult: (result: ScanResult) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ onSelectResult }) => {
  const [items, setItems] = useState<ScanResult[]>([]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'url' | 'wifi' | 'vcard' | 'batch' | 'fav'>('all');

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

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    StorageService.deleteScan(id);
    loadData();
  };

  const exportHistoryCsv = () => {
    const headers = 'ID,Type,Format,Favorite,Timestamp,Raw Value\n';
    const rows = items
      .map((b) => `"${b.id}","${b.contentType}","${b.format}","${b.isFavorite ? 'true' : 'false'}","${new Date(b.timestamp).toISOString()}","${b.rawValue.replace(/"/g, '""')}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scandesk_history_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportHistoryJson = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scandesk_history_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = items.filter((item) => {
    const matchesQuery = item.rawValue.toLowerCase().includes(query.toLowerCase());
    if (!matchesQuery) return false;

    if (activeFilter === 'fav') return !!item.isFavorite;
    if (activeFilter === 'batch') return !!item.isBatchItem;
    if (activeFilter === 'url') return item.contentType === 'url';
    if (activeFilter === 'wifi') return item.contentType === 'wifi';
    if (activeFilter === 'vcard') return item.contentType === 'vcard';
    return true;
  });

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Search & Export Toolbar */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
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

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <>
                <button
                  onClick={exportHistoryCsv}
                  className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
                  title="Export to CSV"
                >
                  CSV
                </button>
                <button
                  onClick={exportHistoryJson}
                  className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
                  title="Export to JSON"
                >
                  JSON
                </button>
                <button onClick={handleClear} className="text-xs text-rose-600 font-semibold hover:underline px-1">
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Scans' },
            { id: 'fav', label: 'Starred' },
            { id: 'url', label: 'Links' },
            { id: 'wifi', label: 'Wi-Fi' },
            { id: 'vcard', label: 'Contacts' },
            { id: 'batch', label: 'Batch' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap text-[11px] transition ${
                activeFilter === f.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white border border-slate-200/80 text-slate-500 text-xs shadow-xs">
            No scan records found matching this filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectResult(item)}
              className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/50 cursor-pointer transition shadow-xs group"
            >
              <div className="min-w-0 pr-3 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {item.categoryTitle || item.contentType}
                  </span>
                  {item.isBatchItem && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md uppercase">
                      Batch
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-slate-800 truncate">{item.rawValue}</p>
                <span className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button onClick={(e) => handleToggleStar(e, item.id)} className="text-slate-300 hover:text-amber-500 p-1.5">
                  <Star className={`h-4 w-4 ${item.isFavorite ? 'text-amber-500 fill-amber-500' : ''}`} />
                </button>
                <button
                  onClick={(e) => handleDeleteItem(e, item.id)}
                  className="text-slate-300 hover:text-rose-600 p-1.5 opacity-0 group-hover:opacity-100 transition"
                  title="Delete"
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


