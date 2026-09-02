import React from 'react';
import { ScanLine, ShieldCheck, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDemo }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400 shadow-inner">
          <ScanLine className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white">ScanDesk</span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
              PRO
            </span>
          </div>
          <p className="text-xs text-slate-400">Offline QR & Barcode Intelligence</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenDemo}
          className="flex items-center gap-1.5 rounded-xl bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Quick Demo</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Zero Telemetry</span>
        </div>
      </div>
    </header>
  );
};
