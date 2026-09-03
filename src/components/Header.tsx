import React from 'react';
import { HelpCircle, ScanLine, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-sky-100/80 bg-white/85 backdrop-blur-xl px-4 py-3 sm:px-6 shadow-xs shadow-sky-900/5 transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-400 to-indigo-500 text-white shadow-md shadow-sky-500/25 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
            <ScanLine className="h-5 w-5 stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500 border-2 border-white"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors">
                ScanDesk
              </h1>
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-600 border border-sky-200/60">
                Live
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">Smart Optical Scanner & QR Studio</p>
          </div>
        </div>

        {/* Guide Trigger Button */}
        <button
          onClick={onOpenGuide}
          className="group flex items-center gap-1.5 rounded-2xl bg-sky-50 hover:bg-sky-100/80 border border-sky-200/70 px-3.5 py-2 text-xs font-semibold text-sky-700 shadow-xs hover:shadow-md hover:shadow-sky-500/10 hover:-translate-y-0.5 transition-all duration-200"
        >
          <Sparkles className="h-3.5 w-3.5 text-sky-500 group-hover:rotate-12 transition-transform duration-300" />
          <span>Guide</span>
        </button>
      </div>
    </header>
  );
};
