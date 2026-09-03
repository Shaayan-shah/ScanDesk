import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScannerTab } from './components/ScannerTab';
import { GeneratorTab } from './components/GeneratorTab';
import { HistoryTab } from './components/HistoryTab';
import { ResultModal } from './components/ResultModal';
import { OnboardingModal } from './components/OnboardingModal';
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
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 text-zinc-900 font-sans pb-20 sm:pb-0">
      <Header onOpenGuide={() => setIsGuideOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        {/* Desktop Tab Selector */}
        <div className="hidden sm:flex items-center justify-center gap-1.5 mb-6">
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition shadow-xs ${
                  isSel
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200/80'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
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

      {/* Result Bottom Sheet & Guide Modal */}
      <ResultModal result={selectedResult} onClose={() => setSelectedResult(null)} />
      <OnboardingModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-6 py-2.5 flex justify-around shadow-sm">
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
              className={`flex flex-col items-center gap-0.5 text-[11px] font-medium transition ${
                isSel ? 'text-zinc-900 font-semibold' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <Icon className="h-4.5 w-4.5 stroke-[2]" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default App;
