import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScannerTab } from './components/ScannerTab';
import { GeneratorTab } from './components/GeneratorTab';
import { HistoryTab } from './components/HistoryTab';
import { ResultModal } from './components/ResultModal';
import { OnboardingModal } from './components/DemoModal';
import { ScanResult } from './types';
import { Camera, QrCode, History } from 'lucide-react';

type Tab = 'scanner' | 'generator' | 'history';

export function App() {
  const [tab, setTab] = useState<Tab>('scanner');
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('scandesk_onboarded');
    if (!hasSeenGuide) {
      setIsGuideOpen(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans pb-20 sm:pb-0">
      <Header onOpenGuide={() => setIsGuideOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        {/* Desktop Tab Selector */}
        <div className="hidden sm:flex items-center justify-center gap-2 mb-6">
          {[
            { id: 'scanner', label: 'Scanner', icon: Camera },
            { id: 'generator', label: 'Generator', icon: QrCode },
            { id: 'history', label: 'History', icon: History },
          ].map((t) => {
            const Icon = t.icon;
            const isSel = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-xs ${
                  isSel
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Screen View */}
        {tab === 'scanner' && <ScannerTab onScanResult={setSelectedResult} />}
        {tab === 'generator' && <GeneratorTab />}
        {tab === 'history' && <HistoryTab onSelectResult={setSelectedResult} />}
      </main>

      {/* Result Bottom Sheet & Interactive Guide */}
      <ResultModal result={selectedResult} onClose={() => setSelectedResult(null)} />
      <OnboardingModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2.5 flex justify-around shadow-lg">
        {[
          { id: 'scanner', label: 'Scanner', icon: Camera },
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
                isSel ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              <Icon className="h-5 w-5 stroke-[2]" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default App;

