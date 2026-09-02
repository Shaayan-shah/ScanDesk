import React from 'react';
import { X, Sparkles, Wifi, UserPlus, Link, Tag } from 'lucide-react';
import { ScanResult } from '../types';
import { ContentParser } from '../services/parser';
import { StorageService } from '../services/storage';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (result: ScanResult) => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose, onSelectSample }) => {
  if (!isOpen) return null;

  const samples = [
    {
      title: 'Coffee Shop Guest Wi-Fi',
      desc: 'WIFI:S:BrewCafe_5G;T:WPA;P:FreshRoast2026;;',
      icon: Wifi,
      category: 'Wi-Fi'
    },
    {
      title: 'Software Lead vCard Contact',
      desc: 'BEGIN:VCARD\nVERSION:3.0\nFN:Shayan Shah\nTEL:+923001234567\nORG:DecodeLabs\nEND:VCARD',
      icon: UserPlus,
      category: 'Contact'
    },
    {
      title: 'Verified Portfolio Website',
      desc: 'https://github.com/Shaayan-shah',
      icon: Link,
      category: 'Safe URL'
    },
    {
      title: 'EAN-13 Retail Product Barcode',
      desc: '9780134685991',
      icon: Tag,
      category: 'Product'
    },
  ];

  const handlePick = (raw: string) => {
    const parsed = ContentParser.parse(raw);
    StorageService.saveScan(parsed);
    onSelectSample(parsed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Interactive Demo Samples</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>

        <p className="text-xs text-slate-400">
          Tap any real-world sample below to test instant decoding and smart contextual actions:
        </p>

        <div className="space-y-2">
          {samples.map((s, idx) => {
            const Icon = s.icon;
            return (
              <button
                key={idx}
                onClick={() => handlePick(s.desc)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition">{s.title}</p>
                    <span className="text-[10px] text-slate-500 uppercase">{s.category}</span>
                  </div>
                </div>
                <span className="text-xs text-cyan-400 font-semibold">Test →</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
