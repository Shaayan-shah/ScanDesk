import React, { useState } from 'react';
import { ScanResult } from '../types';
import { X, Copy, ExternalLink, Check, ShieldCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-100 p-6 space-y-5 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              {result.categoryTitle || result.contentType.toUpperCase()}
            </span>
            <span className="text-[11px] text-slate-400 uppercase font-medium">{result.format.replace('_', ' ')}</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Box */}
        <div className="space-y-3">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Decoded Content</span>
              <span className="text-[11px] text-slate-400 font-mono">{new Date(result.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="text-xs sm:text-sm font-mono text-slate-800 break-all leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60">
              {result.rawValue}
            </p>
          </div>

          {/* Clean Guidance */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-xs text-slate-600">
              {isUrl
                ? 'Standard web link. You can open it securely in your browser.'
                : result.contentType === 'wifi'
                ? 'Wi-Fi network configuration. Ready to use.'
                : result.contentType === 'vcard'
                ? 'Contact information formatted and ready.'
                : 'Scanned text. You can copy it to your clipboard.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          {isUrl && (
            <a
              href={result.rawValue.startsWith('http') ? result.rawValue : `https://${result.rawValue}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition"
            >
              <ExternalLink className="h-4 w-4" /> Open Website
            </a>
          )}

          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200/80 py-3.5 text-xs font-bold text-slate-700 transition"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

