import React, { useState } from 'react';
import { Sliders, ShieldCheck, Database, Trash2 } from 'lucide-react';
import { HistoryRepository } from '../../services/storage/historyRepository';

export const SettingsView: React.FC = () => {
  const [duplicateCooldown, setDuplicateCooldown] = useState(1500);
  const [soundFeedback, setSoundFeedback] = useState(true);
  const [clearedMsg, setClearedMsg] = useState(false);

  const handleWipeStorage = async () => {
    if (confirm('Are you sure you want to permanently clear all local scan history?')) {
      await HistoryRepository.clearAll();
      setClearedMsg(true);
      setTimeout(() => setClearedMsg(false), 3000);
    }
  };

  return (
    <div className='max-w-3xl mx-auto space-y-6'>
      <div className='p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5'>
        <div className='flex items-center gap-2 border-b border-slate-800 pb-3'>
          <Sliders className='h-5 w-5 text-emerald-400' />
          <h3 className='text-sm font-bold text-white'>Scanning & Detection Engine</h3>
        </div>

        <div className='space-y-4'>
          <div>
            <div className='flex justify-between text-xs font-semibold text-slate-300 mb-2'>
              <span>Duplicate Suppression Cooldown</span>
              <span className='font-mono text-emerald-400'>{(duplicateCooldown / 1000).toFixed(1)}s</span>
            </div>
            <input
              type='range'
              min={500}
              max={5000}
              step={250}
              value={duplicateCooldown}
              onChange={(e) => setDuplicateCooldown(Number(e.target.value))}
              className='w-full accent-emerald-500 cursor-pointer'
            />
            <p className='text-[11px] text-slate-400 mt-1'>Prevents repeated triggers on the same code in continuous scanning.</p>
          </div>

          <div className='flex items-center justify-between pt-2'>
            <div>
              <p className='text-xs font-semibold text-slate-200'>Audio Feedback Chime</p>
              <p className='text-[11px] text-slate-400'>Play pleasant sine synthesized audio on decode</p>
            </div>
            <input
              type='checkbox'
              checked={soundFeedback}
              onChange={(e) => setSoundFeedback(e.target.checked)}
              className='h-4 w-4 accent-emerald-500 rounded'
            />
          </div>
        </div>
      </div>

      <div className='p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3'>
        <div className='flex items-center gap-2 text-emerald-400 font-semibold text-sm'>
          <ShieldCheck className='h-5 w-5' />
          <span>Local-First Zero Telemetry Guarantee</span>
        </div>
        <p className='text-xs text-slate-400 leading-relaxed'>
          ScanDesk operates 100% locally on your machine. Decoded barcodes, generated QR codes, Wi-Fi credentials, and
          contact cards are never transmitted over the internet or logged to any cloud server.
        </p>
      </div>

      <div className='p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4'>
        <div className='flex items-center gap-2 border-b border-slate-800 pb-3'>
          <Database className='h-5 w-5 text-emerald-400' />
          <h3 className='text-sm font-bold text-white'>Local Storage & Privacy</h3>
        </div>

        <div className='flex items-center justify-between'>
          <div>
            <p className='text-xs font-semibold text-slate-200'>IndexedDB Local Storage</p>
            <p className='text-[11px] text-slate-400'>Clear all locally saved scan history and favorites</p>
          </div>
          <button
            onClick={handleWipeStorage}
            className='flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition'
          >
            <Trash2 className='h-3.5 w-3.5' /> Wipe History
          </button>
        </div>

        {clearedMsg && <p className='text-xs text-emerald-400 font-medium'>All local scan history has been wiped clean.</p>}
      </div>
    </div>
  );
};
