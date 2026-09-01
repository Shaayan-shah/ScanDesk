import React, { useState } from "react";
import { ScanResult } from "../../types";
import { X, Copy, ExternalLink, Wifi, UserPlus, Phone, Mail, Check, AlertTriangle, ShieldCheck, Tag } from "lucide-react";
import { SecurityService } from "../../services/security/securityService";
import { HistoryRepository } from "../../services/storage/historyRepository";

interface ResultModalProps {
  result: ScanResult | null;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ result, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState(result?.notes || "");
  const [isSaved, setIsSaved] = useState(false);

  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.rawValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNotes = async () => {
    await HistoryRepository.updateNotes(result.id, notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 uppercase tracking-wider border border-emerald-500/20">
              {result.format.replace("_", " ")}
            </span>
            <span className="text-xs text-slate-400 uppercase">{result.contentType}</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content specific parsed view */}
        <div className="space-y-3">
          {result.contentType === "url" && result.parsedData.type === "url" && (
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <ShieldCheck className="h-4 w-4" />
                <span>Verified Safe URL Domain: {result.parsedData.domain}</span>
              </div>
              <p className="text-sm font-mono text-slate-200 break-all">{result.parsedData.url}</p>
              <a
                href={result.parsedData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open in Web Browser
              </a>
            </div>
          )}

          {result.contentType === "wifi" && result.parsedData.type === "wifi" && (
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <Wifi className="h-4 w-4" />
                <span>Wi-Fi Network Credentials</span>
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <p><strong>SSID:</strong> {result.parsedData.wifi.ssid}</p>
                <p><strong>Security:</strong> {result.parsedData.wifi.authType}</p>
                {result.parsedData.wifi.password && <p><strong>Password:</strong> {result.parsedData.wifi.password}</p>}
              </div>
            </div>
          )}

          {result.contentType === "vcard" && result.parsedData.type === "vcard" && (
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <UserPlus className="h-4 w-4" />
                <span>Contact Card: {result.parsedData.contact.fullName}</span>
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                {result.parsedData.contact.phone && <p><strong>Phone:</strong> {result.parsedData.contact.phone}</p>}
                {result.parsedData.contact.email && <p><strong>Email:</strong> {result.parsedData.contact.email}</p>}
                {result.parsedData.contact.organization && <p><strong>Organization:</strong> {result.parsedData.contact.organization}</p>}
              </div>
            </div>
          )}

          {/* Raw Value Card */}
          <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">Raw Payload</label>
            <p className="text-xs font-mono text-slate-300 break-all max-h-32 overflow-y-auto whitespace-pre-wrap">
              {SecurityService.escapeHtml(result.rawValue)}
            </p>
          </div>

          {/* Notes Section */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">User Note</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add custom note or tag..."
                className="flex-1 rounded-lg bg-slate-950 px-3 py-1.5 text-xs text-slate-200 border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSaveNotes}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
              >
                {isSaved ? "Saved!" : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-500">{new Date(result.timestamp).toLocaleString()}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Payload"}
          </button>
        </div>
      </div>
    </div>
  );
};
