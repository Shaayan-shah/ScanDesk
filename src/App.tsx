import React, { useState } from 'react';
import { Header } from './components/Header';
import { ScannerTab } from './components/ScannerTab';
import { GeneratorTab } from './components/GeneratorTab';
import { HistoryTab } from './components/HistoryTab';
import { ResultModal } from './components/ResultModal';
import { DemoModal } from './components/DemoModal';
import { ScanResult } from './types';
import { ScanLine, QrCode, History, ShieldCheck } from 'lucide-react';

type Tab = 'scanner' | 'generator' | 'history';

export function App() {
  const [tab, setTab] = useState<Tab>('scanner');
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#030712] text-slate-100 font-sans pb-20 sm:pb-0">
      <Header onOpenDemo={() => setIsDemoOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        {/* Tab Selector for Desktop */}
        <div className="hidden sm:flex items-center justify-center gap-2 mb-6">
          {[
            { id: 'scanner', label: 'Live Scanner', icon: ScanLine },
            { id: 'generator', label: 'QR Studio', icon: QrCode },
            { id: 'history', label: 'Saved History', icon: History },
          ].map((t) => {
            const Icon = t.icon;
            const isSel = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={`flex items-center gap-2 px-5 py-2 rounded-2xl text-xs font-bold transition ${
                  isSel
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Screen */}
        {tab === 'scanner' && <ScannerTab onScanResult={setSelectedResult} />}
        {tab === 'generator' && <GeneratorTab />}
        {tab === 'history' && <HistoryTab onSelectResult={setSelectedResult} />}
      </main>

      {/* Result Bottom Sheet & Demo Modal */}
      <ResultModal result={selectedResult} onClose={() => setSelectedResult(null)} />
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} onSelectSample={setSelectedResult} />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-6 py-3 flex justify-around">
        {[
          { id: 'scanner', label: 'Scanner', icon: ScanLine },
          { id: 'generator', label: 'Generator', icon: QrCode },
          { id: 'history', label: 'History', icon: History },
        ].map((t) => {
          const Icon = t.icon;
          const isSel = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
                isSel ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default App;
