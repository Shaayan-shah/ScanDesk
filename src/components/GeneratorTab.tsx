import React, { useState, useEffect } from 'react';
import { QrCode, Download, Wifi, UserPlus, Link, FileText, Phone, Mail, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';

type Template = 'url' | 'wifi' | 'vcard' | 'text' | 'phone';

export const GeneratorTab: React.FC = () => {
  const [template, setTemplate] = useState<Template>('url');
  const [payload, setPayload] = useState('https://github.com/Shaayan-shah/ScanDesk');
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Form states
  const [wifi, setWifi] = useState({ ssid: 'Home_WiFi_5G', pass: 'Secret123', auth: 'WPA' });
  const [vcard, setVcard] = useState({ name: 'Shayan Shah', phone: '+923001234567', org: 'DecodeLabs' });
  const [phone, setPhone] = useState('+923001234567');

  useEffect(() => {
    let text = payload;
    if (template === 'wifi') {
      text = `WIFI:T:${wifi.auth};S:${wifi.ssid};P:${wifi.pass};;`;
    } else if (template === 'vcard') {
      text = `BEGIN:VCARD\nVERSION:3.0\nFN:${vcard.name}\nTEL:${vcard.phone}\nORG:${vcard.org}\nEND:VCARD`;
    } else if (template === 'phone') {
      text = `tel:${phone}`;
    }

    QRCode.toDataURL(text, { width: 400, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [template, payload, wifi, vcard, phone]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `scandesk_qr_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-4xl mx-auto">
      {/* Left Form */}
      <div className="lg:col-span-7 space-y-4">
        {/* Template Buttons */}
        <div className="grid grid-cols-5 gap-2">
          {[
            { id: 'url', label: 'Link', icon: Link },
            { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
            { id: 'vcard', label: 'Contact', icon: UserPlus },
            { id: 'text', label: 'Text', icon: FileText },
            { id: 'phone', label: 'Phone', icon: Phone },
          ].map((t) => {
            const Icon = t.icon;
            const isSel = template === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id as Template)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border text-xs font-semibold transition ${
                  isSel ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[11px]">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Inputs */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          {template === 'url' && (
            <div>
              <label className="text-xs text-slate-400 block mb-1">Target Website URL</label>
              <input
                type="url"
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {template === 'wifi' && (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Network SSID</label>
                <input
                  type="text"
                  value={wifi.ssid}
                  onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Password</label>
                <input
                  type="text"
                  value={wifi.pass}
                  onChange={(e) => setWifi({ ...wifi, pass: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white"
                />
              </div>
            </div>
          )}

          {template === 'vcard' && (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={vcard.name}
                  onChange={(e) => setVcard({ ...vcard, name: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={vcard.phone}
                  onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white"
                />
              </div>
            </div>
          )}

          {template === 'text' && (
            <div>
              <label className="text-xs text-slate-400 block mb-1">Raw Text</label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={3}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Right QR Preview */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>100% Offline Verified</span>
        </div>

        <div className="p-3 bg-white rounded-2xl shadow-inner">
          {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-lg" />}
        </div>

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md"
        >
          <Download className="h-4 w-4" /> Download QR PNG
        </button>
      </div>
    </div>
  );
};
