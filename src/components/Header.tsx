import React from 'react';
import { HelpCircle, QrCode } from 'lucide-react';

interface HeaderProps {
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 py-3 sm:px-6 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20">
          <QrCode className="h-5 w-5 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-slate-900">ScanDesk</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              Offline
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">QR & Barcode Utility</p>
        </div>
      </div>

      <button
        onClick={onOpenGuide}
        className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition"
        title="App Guide"
      >
        <HelpCircle className="h-4 w-4 text-slate-500" />
        <span className="hidden sm:inline">How to Use</span>
      </button>
    </header>
  );
};

