import React, { useState } from 'react';
import { Navbar, NavTab } from './components/common/Navbar';
import { CameraScanner } from './components/scanner/CameraScanner';
import { ImageScanner } from './components/scanner/ImageScanner';
import { BatchScanner } from './components/batch/BatchScanner';
import { QRGenerator } from './components/generator/QRGenerator';
import { HistoryView } from './components/history/HistoryView';
import { SettingsView } from './components/settings/SettingsView';
import { ResultModal } from './components/common/ResultModal';
import { ScanResult } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('scan');
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);
  const [isDark, setIsDark] = useState(true);

  const handleScanSuccess = (result: ScanResult) => {
    setSelectedResult(result);
  };

  return (
    <div className={isDark ? "min-h-screen flex flex-col dark bg-slate-950 text-slate-100" : "min-h-screen flex flex-col bg-slate-50 text-slate-900"}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} setIsDark={setIsDark} />

      <main className='flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6'>
        {activeTab === 'scan' && <CameraScanner onScanResult={handleScanSuccess} />}
        {activeTab === 'image' && <ImageScanner onScanResult={handleScanSuccess} />}
        {activeTab === 'batch' && <BatchScanner />}
        {activeTab === 'generate' && <QRGenerator />}
        {activeTab === 'history' && <HistoryView onSelectResult={(res) => setSelectedResult(res)} />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      <ResultModal result={selectedResult} onClose={() => setSelectedResult(null)} />

      <footer className='border-t border-slate-800/60 py-4 text-center text-xs text-slate-500'>
        ScanDesk Pro • Private Offline QR & Barcode Intelligence • Built by Shayan Shah
      </footer>
    </div>
  );
};
