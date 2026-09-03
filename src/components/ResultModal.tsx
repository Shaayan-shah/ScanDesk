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
  ShieldCheck,
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-sky-100 p-6 sm:p-7 space-y-4 shadow-2xl shadow-sky-950/20 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sky-100 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 border border-sky-200/60">
              {result.categoryTitle || result.contentType.toUpperCase()}
            </span>
            <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              {result.format.replace('_', ' ')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-sky-50 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wi-Fi Details Card */}
        {isWifi && result.parsedWifi && (
          <div className="rounded-2xl bg-gradient-to-br from-sky-50/70 to-blue-50/40 border border-sky-100 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sky-900 font-bold text-xs">
              <Wifi className="h-4 w-4 text-sky-600" /> Wi-Fi Network Credentials
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-xs">
                <span className="text-[10px] text-slate-400 font-medium block">Network (SSID)</span>
                <span className="font-bold text-slate-900">{result.parsedWifi.ssid}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-xs">
                <span className="text-[10px] text-slate-400 font-medium block">Security</span>
                <span className="font-bold text-slate-900">{result.parsedWifi.authType}</span>
              </div>
            </div>
            {result.parsedWifi.password && (
              <div className="bg-white p-3 rounded-xl border border-sky-100 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Password</span>
                  <span className="font-mono text-xs font-bold text-sky-950">{result.parsedWifi.password}</span>
                </div>
                <button
                  onClick={() => handleCopy(result.parsedWifi!.password || '')}
                  className="text-xs bg-sky-50 text-sky-700 hover:bg-sky-100 px-3 py-1.5 rounded-xl font-bold border border-sky-200 transition"
                >
                  {copied ? 'Copied' : 'Copy Password'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Contact vCard Card */}
        {isVcard && result.parsedVCard && (
          <div className="rounded-2xl bg-gradient-to-br from-sky-50/70 to-blue-50/40 border border-sky-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-900 font-bold text-xs">
                <User className="h-4 w-4 text-sky-600" /> Contact Profile
              </div>
              <button
                onClick={handleDownloadVCard}
                className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs transition"
              >
                <Download className="h-3.5 w-3.5" /> Save .VCF
              </button>
            </div>
            <div className="space-y-1.5 text-xs bg-white p-3.5 rounded-xl border border-sky-100 shadow-xs">
              <p className="font-bold text-slate-900 text-sm">{result.parsedVCard.fullName}</p>
              {result.parsedVCard.organization && (
                <p className="text-slate-500 font-medium">{result.parsedVCard.organization}</p>
              )}
              {result.parsedVCard.phone && (
                <p className="text-slate-800 flex items-center gap-1.5 pt-1 font-semibold">
                  <Phone className="h-3.5 w-3.5 text-sky-500" /> {result.parsedVCard.phone}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Content Box */}
        <div className="rounded-2xl bg-sky-50/40 p-4 border border-sky-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Decoded Payload</span>
            <span className="text-[10px] text-slate-400">{new Date(result.timestamp).toLocaleTimeString()}</span>
          </div>
          <p className="text-xs font-mono text-slate-800 break-all leading-relaxed bg-white p-3.5 rounded-xl border border-sky-100 max-h-40 overflow-y-auto shadow-inner">
            {result.rawValue}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {isUrl && (
            <a
              href={result.rawValue.startsWith('http') ? result.rawValue : `https://${result.rawValue}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 py-3.5 text-xs font-bold text-white shadow-md shadow-sky-500/25 hover:-translate-y-0.5 transition-all"
            >
              <ExternalLink className="h-4 w-4" /> Open Website
            </a>
          )}

          {isWhatsapp && (
            <a
              href={result.rawValue.startsWith('http') ? result.rawValue : `https://${result.rawValue}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-500/25 hover:-translate-y-0.5 transition-all"
            >
              <MessageCircle className="h-4 w-4" /> Open WhatsApp
            </a>
          )}

          {isPhone && (
            <a
              href={result.rawValue}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 py-3.5 text-xs font-bold text-white shadow-md shadow-sky-500/25 hover:-translate-y-0.5 transition-all"
            >
              <Phone className="h-4 w-4" /> Call Number
            </a>
          )}

          <button
            onClick={() => handleCopy(result.rawValue)}
            className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200/70 py-3.5 text-xs font-bold text-sky-800 hover:-translate-y-0.5 transition-all"
          >
            {copied ? <Check className="h-4 w-4 text-sky-600" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied' : 'Copy Content'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
