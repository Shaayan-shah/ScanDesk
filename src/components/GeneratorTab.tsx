import React, { useState, useEffect } from 'react';
import { Download, Link, Wifi, User, Phone, FileText } from 'lucide-react';
import QRCode from 'qrcode';

type Template = 'url' | 'wifi' | 'vcard' | 'text' | 'phone';

export const GeneratorTab: React.FC = () => {
  const [template, setTemplate] = useState<Template>('url');
  const [payload, setPayload] = useState('https://github.com/Shaayan-shah/ScanDesk');
  const [qrDataUrl, setQrDataUrl] = useState('');

  const [wifi, setWifi] = useState({ ssid: 'Office_Guest', pass: 'Network2026', auth: 'WPA' });
  const [vcard, setVcard] = useState({ name: 'Shayan Shah', phone: '+923001234567', org: 'DecodeLabs' });
  const [phone, setPhone] = useState('+923001234567');

  useEffect(() => {
    let text = payload;
    if (template === 'wifi') {
      text = `WIFI:T:${wifi.auth};S:${wifi.ssid};P:${wifi.pass};;`;
    } else if (template === 'vcard') {
      text = `BEGIN:VCARD\\nVERSION:3.0\\nFN:${vcard.name}\\nTEL:${vcard.phone}\\nORG:${vcard.org}\\nEND:VCARD`;
    } else if (template === 'phone') {
      text = `tel:${phone}`;
    }

    QRCode.toDataURL(text, { width: 400, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } })
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
            { id: 'vcard', label: 'Contact', icon: User },
            { id: 'text', label: 'Text', icon: FileText },
            { id: 'phone', label: 'Phone', icon: Phone },
          ].map((t) => {
            const Icon = t.icon;
            const isSel = template === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id as Template)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition ${
                  isSel ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs' : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[11px]">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Inputs */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 space-y-3 shadow-xs">
          {template === 'url' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Target Website URL</label>
              <input
                type="url"
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
              />
            </div>
          )}

          {template === 'wifi' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Network Name (SSID)</label>
                <input
                  type="text"
                  value={wifi.ssid}
                  onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                <input
                  type="text"
                  value={wifi.pass}
                  onChange={(e) => setWifi({ ...wifi, pass: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
                />
              </div>
            </div>
          )}

          {template === 'vcard' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={vcard.name}
                  onChange={(e) => setVcard({ ...vcard, name: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={vcard.phone}
                  onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
                />
              </div>
            </div>
          )}

          {template === 'text' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Raw Message</label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={3}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
              />
            </div>
          )}

          {template === 'phone' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
              />
            </div>
          )}
        </div>
      </div>

      {/* Right QR Preview */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
          {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-lg" />}
        </div>

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition"
        >
          <Download className="h-4 w-4" /> Download QR Image
        </button>
      </div>
    </div>
  );
};

