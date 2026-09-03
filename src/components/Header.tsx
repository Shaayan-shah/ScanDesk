import React from 'react';
import { HelpCircle, QrCode } from 'lucide-react';

interface HeaderProps {
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200/80 bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-xs">
          <QrCode className="h-4.5 w-4.5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-zinc-900 leading-none">ScanDesk</h1>
          <p className="text-[11px] text-zinc-500 mt-0.5">Scanner & QR Studio</p>
        </div>
      </div>

      <button
        onClick={onOpenGuide}
        className="flex items-center gap-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/70 px-3 py-1.5 text-xs font-medium text-zinc-700 transition"
      >
        <HelpCircle className="h-3.5 w-3.5 text-zinc-500" />
        <span>Guide</span>
      </button>
    </header>
  );
};
