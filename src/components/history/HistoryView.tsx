import React, { useState, useEffect } from 'react';
import { History, Search, Trash2, Star, Download } from 'lucide-react';
import { ScanResult } from '../../types';
import { HistoryRepository } from '../../services/storage/historyRepository';
import { ExportService } from '../../services/export/exportService';

interface HistoryViewProps {
  onSelectResult: (result: ScanResult) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onSelectResult }) => {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const loadHistory = async () => {
    const all = await HistoryRepository.getAllScans();
    setScans(all);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleToggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await HistoryRepository.toggleFavorite(id);
    loadHistory();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await HistoryRepository.deleteScan(id);
    loadHistory();
  };

  const filteredScans = scans.filter((s) => {
    const matchesSearch =
      s.rawValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || s.contentType === filterType;
    const matchesFav = !onlyFavorites || s.isFavorite;
    return matchesSearch && matchesType && matchesFav;
  });

  return (
    <div className='max-w-5xl mx-auto space-y-6'>
      <div className='flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800'>
        <div className='relative w-full sm:w-80'>
          <Search className='absolute left-3 top-2.5 h-4 w-4 text-slate-500' />
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search scans, notes, domains...'
            className='w-full rounded-xl bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-200 border border-slate-800 focus:outline-none focus:border-emerald-500'
          />
        </div>

        <div className='flex items-center gap-2 w-full sm:w-auto overflow-x-auto'>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className='rounded-xl bg-slate-950 px-3 py-2 text-xs text-slate-300 border border-slate-800 focus:outline-none'
          >
            <option value='all'>All Content Types</option>
            <option value='url'>Web URLs</option>
            <option value='wifi'>Wi-Fi Networks</option>
            <option value='vcard'>Contacts</option>
            <option value='product_code'>Product Barcodes</option>
            <option value='plain'>Plain Text</option>
          </select>

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition ' + (onlyFavorites ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-950 text-slate-400 border border-slate-800')}
          >
            <Star className={'h-3.5 w-3.5 ' + (onlyFavorites ? 'fill-amber-400' : '')} />
            Favorites
          </button>

          <button
            onClick={() => ExportService.exportToCSV(filteredScans)}
            className='rounded-xl bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition'
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className='space-y-2'>
        {filteredScans.length === 0 ? (
          <div className='flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-2 text-slate-500'>
            <History className='h-10 w-10 text-slate-600 stroke-[1.5]' />
            <p className='text-sm font-semibold text-slate-400'>No scan history recorded</p>
            <p className='text-xs text-slate-500'>Items you scan will be securely saved here locally in IndexedDB.</p>
          </div>
        ) : (
          filteredScans.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelectResult(s)}
              className='flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition group'
            >
              <div className='flex items-center gap-4 min-w-0'>
                <button onClick={(e) => handleToggleFavorite(e, s.id)} className='text-slate-500 hover:text-amber-400'>
                  <Star className={'h-4 w-4 ' + (s.isFavorite ? 'text-amber-400 fill-amber-400' : '')} />
                </button>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider'>
                      {s.format.replace('_', ' ')}
                    </span>
                    <span className='text-[11px] text-slate-400'>{new Date(s.timestamp).toLocaleString()}</span>
                  </div>
                  <p className='text-xs font-mono text-slate-200 truncate group-hover:text-emerald-300 transition'>
                    {s.rawValue}
                  </p>
                  {s.notes && <p className='text-[11px] text-slate-400 italic mt-0.5'>Note: {s.notes}</p>}
                </div>
              </div>

              <div className='flex items-center gap-2 ml-4'>
                <button
                  onClick={(e) => handleDelete(e, s.id)}
                  className='rounded-lg p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition'
                  title='Delete Item'
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
