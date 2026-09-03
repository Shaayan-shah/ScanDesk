import React, { useState } from 'react';
import { ScanResult } from '../types';
import {
  X,
  Copy,
  ExternalLink,
  Check,
  ShieldCheck,
  AlertTriangle,
  Wifi,
  User,
  Phone,
  Mail,
  Download,
  Share2,
  Lock,
  MessageCircle,
} from 'lucide-react';

interface ResultModalProps {
  result: ScanResult | null;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ result, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copiedClean, setCopiedClean] = useState(false);

  if (!result) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyClean = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedClean(true);
    setTimeout(() => setCopiedClean(false), 2000);
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
  const isEmail = result.contentType === 'email';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-100 p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        
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

        {/* 1. Wi-Fi Smart Card */}
        {isWifi && result.parsedWifi && (
          <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <Wifi className="h-4 w-4" /> Wi-Fi Credentials
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Network (SSID)</span>
                <span className="font-semibold text-slate-800">{result.parsedWifi.ssid}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Security</span>
                <span className="font-semibold text-slate-800">{result.parsedWifi.authType}</span>
              </div>
            </div>
            {result.parsedWifi.password && (
              <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Password</span>
                  <span className="font-mono text-xs font-bold text-slate-900">{result.parsedWifi.password}</span>
                </div>
                <button
                  onClick={() => handleCopy(result.parsedWifi!.password || '')}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  {copied ? 'Copied!' : 'Copy Password'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. vCard Smart Card */}
        {isVcard && result.parsedVCard && (
          <div className="rounded-2xl bg-blue-50/70 border border-blue-200/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                <User className="h-4 w-4" /> Contact Card
              </div>
              <button
                onClick={handleDownloadVCard}
                className="flex items-center gap-1 text-xs bg-blue-600 text-white font-bold px-2.5 py-1 rounded-lg hover:bg-blue-700 transition"
              >
                <Download className="h-3.5 w-3.5" /> Save .VCF
              </button>
            </div>
            <div className="space-y-1.5 text-xs bg-white p-3 rounded-xl border border-blue-100">
              <p className="font-bold text-slate-900 text-sm">{result.parsedVCard.fullName}</p>
              {result.parsedVCard.organization && (
                <p className="text-slate-600">{result.parsedVCard.organization} {result.parsedVCard.title ? `• ${result.parsedVCard.title}` : ''}</p>
              )}
              {result.parsedVCard.phone && (
                <p className="text-slate-800 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-blue-600" /> {result.parsedVCard.phone}</p>
              )}
              {result.parsedVCard.email && (
                <p className="text-slate-800 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-blue-600" /> {result.parsedVCard.email}</p>
              )}
            </div>
          </div>
        )}

        {/* 3. URL Security Inspector */}
        {isUrl && result.security && (
          <div className="space-y-2.5">
            <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
              result.security.riskScore === 'high'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : result.security.riskScore === 'medium'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-800'
            }`}>
              {result.security.riskScore === 'high' ? (
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs space-y-0.5">
                <p className="font-bold">{result.security.domain || 'Web Domain'}</p>
                <p className="text-slate-600 text-[11px]">{result.security.threatDescription}</p>
              </div>
            </div>

            {result.security.hasTrackingParams && result.security.cleanUrl && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 text-[11px]">🛡️ Tracking parameters stripped</span>
                <button
                  onClick={() => handleCopyClean(result.security!.cleanUrl!)}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  {copiedClean ? 'Copied Clean Link!' : 'Copy Clean Link'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content Box */}
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Raw Decoded Payload</span>
            <span className="text-[11px] text-slate-400 font-mono">{new Date(result.timestamp).toLocaleTimeString()}</span>
          </div>
          <p className="text-xs font-mono text-slate-800 break-all leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60 max-h-36 overflow-y-auto">
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
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition"
            >
              <ExternalLink className="h-4 w-4" /> Open Website
            </a>
          )}

          {isWhatsapp && (
            <a
              href={result.rawValue.startsWith('http') ? result.rawValue : `https://${result.rawValue}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition"
            >
              <MessageCircle className="h-4 w-4" /> Open WhatsApp
            </a>
          )}

          {isPhone && (
            <a
              href={result.rawValue}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition"
            >
              <Phone className="h-4 w-4" /> Call Number
            </a>
          )}

          <button
            onClick={() => handleCopy(result.rawValue)}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200/80 py-3.5 text-xs font-bold text-slate-700 transition"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied' : 'Copy Payload'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};


