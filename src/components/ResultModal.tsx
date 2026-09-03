import React, { useState } from 'react';
import { ScanResult } from '../types';
import {
  X,
  Copy,
  ExternalLink,
  Check,
  Wifi,
  User,
  Phone,
  Mail,
  Download,
  MessageCircle,
} from 'lucide-react';

interface ResultModalProps {
  result: ScanResult | null;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ result, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadVCard = () => {
    const blob = new Blob([result.rawValue], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.parsedVCard?.fullName || 'contact'}.vcf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isUrl = result.contentType === 'url';
  const isWifi = result.contentType === 'wifi';
  const isVcard = result.contentType === 'vcard';
  const isWhatsapp = result.contentType === 'whatsapp';
  const isPhone = result.contentType === 'phone';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-zinc-100 p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800">
              {result.categoryTitle || result.contentType.toUpperCase()}
            </span>
            <span className="text-[11px] text-zinc-400 uppercase font-medium">{result.format.replace('_', ' ')}</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wi-Fi Details */}
        {isWifi && result.parsedWifi && (
          <div className="rounded-2xl bg-zinc-50 border border-zinc-200/80 p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-zinc-900 font-semibold text-xs">
              <Wifi className="h-4 w-4" /> Wi-Fi Network
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-zinc-100">
                <span className="text-[10px] text-zinc-400 font-medium block">Network Name</span>
                <span className="font-semibold text-zinc-800">{result.parsedWifi.ssid}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-zinc-100">
                <span className="text-[10px] text-zinc-400 font-medium block">Security</span>
                <span className="font-semibold text-zinc-800">{result.parsedWifi.authType}</span>
              </div>
            </div>
            {result.parsedWifi.password && (
              <div className="bg-white p-2.5 rounded-xl border border-zinc-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 font-medium block">Password</span>
                  <span className="font-mono text-xs font-semibold text-zinc-900">{result.parsedWifi.password}</span>
                </div>
                <button
                  onClick={() => handleCopy(result.parsedWifi!.password || '')}
                  className="text-xs text-zinc-900 font-semibold hover:underline"
                >
                  {copied ? 'Copied' : 'Copy Password'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* vCard Details */}
        {isVcard && result.parsedVCard && (
          <div className="rounded-2xl bg-zinc-50 border border-zinc-200/80 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-900 font-semibold text-xs">
                <User className="h-4 w-4" /> Contact
              </div>
              <button
                onClick={handleDownloadVCard}
                className="flex items-center gap-1 text-xs bg-zinc-900 text-white font-medium px-2.5 py-1 rounded-lg hover:bg-zinc-800 transition"
              >
                <Download className="h-3 w-3" /> Save .VCF
              </button>
            </div>
            <div className="space-y-1 text-xs bg-white p-3 rounded-xl border border-zinc-100">
              <p className="font-semibold text-zinc-900 text-sm">{result.parsedVCard.fullName}</p>
              {result.parsedVCard.organization && <p className="text-zinc-500">{result.parsedVCard.organization}</p>}
              {result.parsedVCard.phone && (
                <p className="text-zinc-800 flex items-center gap-1.5 pt-1">
                  <Phone className="h-3 w-3 text-zinc-400" /> {result.parsedVCard.phone}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Content Box */}
        <div className="rounded-2xl bg-zinc-50 p-3.5 border border-zinc-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Scanned Content</span>
            <span className="text-[10px] text-zinc-400">{new Date(result.timestamp).toLocaleTimeString()}</span>
          </div>
          <p className="text-xs font-mono text-zinc-800 break-all leading-relaxed bg-white p-3 rounded-xl border border-zinc-100 max-h-36 overflow-y-auto">
            {result.rawValue}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {isUrl && (
            <a
              href={result.rawValue.startsWith('http') ? result.rawValue : `https://${result.rawValue}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 py-3 text-xs font-semibold text-white shadow-xs transition"
            >
              <ExternalLink className="h-4 w-4" /> Open Website
            </a>
          )}

          {isWhatsapp && (
            <a
              href={result.rawValue.startsWith('http') ? result.rawValue : `https://${result.rawValue}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 py-3 text-xs font-semibold text-white shadow-xs transition"
            >
              <MessageCircle className="h-4 w-4" /> Open WhatsApp
            </a>
          )}

          {isPhone && (
            <a
              href={result.rawValue}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 py-3 text-xs font-semibold text-white shadow-xs transition"
            >
              <Phone className="h-4 w-4" /> Call Number
            </a>
          )}

          <button
            onClick={() => handleCopy(result.rawValue)}
            className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 py-3 text-xs font-semibold text-zinc-800 transition"
          >
            {copied ? <Check className="h-4 w-4 text-zinc-900" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
