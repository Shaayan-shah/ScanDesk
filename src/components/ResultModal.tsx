import React, { useState } from 'react';
import { ScanResult } from '../types';
import { X, Copy, ExternalLink, Wifi, UserPlus, Phone, Mail, Check, ShieldCheck } from 'lucide-react';
import { StorageService } from '../services/storage';

interface ResultModalProps {
  result: ScanResult | null;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ result, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.rawValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUrl = result.contentType === 'url';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 uppercase tracking-wider border border-emerald-500/20">
              {result.categoryTitle || result.contentType.toUpperCase()}
            </span>
            <span className="text-[11px] text-slate-400 uppercase">{result.format.replace('_', ' ')}</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Box */}
        <div className="space-y-3">
          <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Decoded Content</span>
              <span className="text-[11px] text-slate-500">{new Date(result.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="text-sm font-mono text-slate-200 break-all">{result.rawValue}</p>
          </div>

          {/* Smart Contextual Suggestion Banner */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-emerald-400">Smart Safe Suggestion</p>
              <p className="text-slate-300">
                {isUrl
                  ? 'Safe verified web URL. You can open it in your default browser.'
                  : result.contentType === 'wifi'
                  ? 'Wi-Fi network credentials detected. Ready to connect.'
                  : result.contentType === 'vcard'
                  ? 'Contact details parsed. Ready to save.'
                  : 'Plain text payload. You can copy or share this data.'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          {isUrl && (
            <a
              href={result.rawValue.startsWith('http') ? result.rawValue : `https://${result.rawValue}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md"
            >
              <ExternalLink className="h-4 w-4" /> Open Link
            </a>
          )}

          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied!' : 'Copy Value'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
