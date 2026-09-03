import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScannerTab } from './components/ScannerTab';
import { GeneratorTab } from './components/GeneratorTab';
import { HistoryTab } from './components/HistoryTab';
import { ResultModal } from './components/ResultModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ScanResult } from './types';
import { Camera, QrCode, History, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col justify-between bg-mesh-pattern text-slate-900 font-sans pb-24 sm:pb-0 transition-colors duration-300">
      <Header onOpenGuide={() => setIsGuideOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Desktop Tab Selector with Motion Pills */}
        <div className="hidden sm:flex items-center justify-center gap-2">
          <div className="flex items-center p-1.5 bg-white/90 backdrop-blur-md rounded-3xl border border-sky-100 shadow-sm shadow-sky-500/5">
            {[
              { id: 'scanner', label: 'Optical Scanner', icon: Camera },
              { id: 'generator', label: 'QR Studio', icon: QrCode },
              { id: 'history', label: 'Scan Ledger', icon: History },
            ].map((t) => {
              const Icon = t.icon;
              const isSel = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as Tab)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    isSel
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 scale-102'
                      : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50/70'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Screen Stage */}
        <div className="animate-in fade-in duration-300">
          {tab === 'scanner' && <ScannerTab onScanResult={setSelectedResult} />}
          {tab === 'generator' && <GeneratorTab />}
          {tab === 'history' && <HistoryTab onSelectResult={setSelectedResult} />}
        </div>
      </main>

      {/* Decoded Action Modal & Guide Modal */}
      <ResultModal result={selectedResult} onClose={() => setSelectedResult(null)} />
      <OnboardingModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-sky-100/80 px-6 py-2.5 flex justify-around shadow-lg shadow-sky-950/10">
        {[
          { id: 'scanner', label: 'Scanner', icon: Camera },
          { id: 'generator', label: 'Studio', icon: QrCode },
          { id: 'history', label: 'History', icon: History },
        ].map((t) => {
          const Icon = t.icon;
          const isSel = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`relative flex flex-col items-center gap-1 text-[11px] font-bold transition-all duration-200 ${
                isSel ? 'text-sky-600 scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {isSel && (
                <span className="absolute -top-2.5 h-1 w-6 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 shadow-sm shadow-sky-400" />
              )}
              <Icon className="h-5 w-5 stroke-[2.2]" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default App;
