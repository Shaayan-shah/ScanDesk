import React, { useState, useEffect } from 'react';
import {
  Download,
  Link,
  Wifi,
  User,
  Phone,
  FileText,
  MessageCircle,
  Mail,
  Copy,
  Check,
  Palette,
  Sparkles,
  Share2,
} from 'lucide-react';
import QRCode from 'qrcode';

type Template = 'url' | 'wifi' | 'vcard' | 'whatsapp' | 'email' | 'phone' | 'text';

export const GeneratorTab: React.FC = () => {
  const [template, setTemplate] = useState<Template>('url');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [activeColor, setActiveColor] = useState('#0369a1');

  // Form Fields
  const [url, setUrl] = useState('https://github.com/Shaayan-shah/ScanDesk');
  const [wifi, setWifi] = useState({ ssid: 'Home_WiFi_5G', pass: 'Wireless2026', auth: 'WPA' });
  const [vcard, setVcard] = useState({
    name: 'Shayan Shah',
    phone: '+923001234567',
    email: 'shayan@example.com',
    org: 'DecodeLabs Studio',
  });
  const [whatsapp, setWhatsapp] = useState({ phone: '+923001234567', text: 'Hello! I scanned your QR code.' });
  const [email, setEmail] = useState({ to: 'hello@example.com', subject: 'Project Inquiry', body: 'Hello Shayan,' });
  const [phoneNum, setPhoneNum] = useState('+923001234567');
  const [plainText, setPlainText] = useState('ScanDesk — Optical Scanner & QR Studio');

  const colorPalettes = [
    { label: 'Sky Blue', hex: '#0284c7' },
    { label: 'Deep Blue', hex: '#1d4ed8' },
    { label: 'Obsidian', hex: '#0f172a' },
    { label: 'Emerald', hex: '#059669' },
    { label: 'Purple', hex: '#7c3aed' },
    { label: 'Coral', hex: '#e11d48' },
  ];

  const getPayload = (): string => {
    switch (template) {
      case 'url':
        return url.startsWith('http') ? url : `https://${url}`;
      case 'wifi':
        return `WIFI:T:${wifi.auth};S:${wifi.ssid};P:${wifi.pass};;`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcard.name}\nTEL:${vcard.phone}\nEMAIL:${vcard.email}\nORG:${vcard.org}\nEND:VCARD`;
      case 'whatsapp':
        return `https://wa.me/${whatsapp.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsapp.text)}`;
      case 'email':
        return `mailto:${email.to}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
      case 'phone':
        return `tel:${phoneNum}`;
      case 'text':
      default:
        return plainText;
    }
  };

  useEffect(() => {
    const payload = getPayload();
    QRCode.toDataURL(payload, {
      width: 600,
      margin: 2,
      color: { dark: activeColor, light: '#ffffff' },
    })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [template, url, wifi, vcard, whatsapp, email, phoneNum, plainText, activeColor]);

  const handleDownloadPng = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `scandesk_${template}_qr.png`;
    a.click();
  };

  const handleCopyImage = async () => {
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Could not copy image directly on this browser.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-4xl mx-auto">
      {/* Left Column: Input Form & Color Swatches */}
      <div className="lg:col-span-7 space-y-4">
        {/* Template Category Tabs */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
          {[
            { id: 'url', label: 'Link', icon: Link },
            { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
            { id: 'vcard', label: 'Contact', icon: User },
            { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
            { id: 'email', label: 'Email', icon: Mail },
            { id: 'phone', label: 'Phone', icon: Phone },
            { id: 'text', label: 'Text', icon: FileText },
          ].map((t) => {
            const Icon = t.icon;
            const isSel = template === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id as Template)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  isSel
                    ? 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 scale-105'
                    : 'bg-white border border-sky-100/80 text-slate-600 hover:bg-sky-50/60 hover:text-sky-700'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSel ? 'animate-bounce' : ''}`} />
                <span className="text-[10px]">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Form Fields Container */}
        <div className="p-5 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-3.5">
          {template === 'url' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Link className="h-3.5 w-3.5 text-sky-500" /> Website URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-2xl bg-sky-50/50 border border-sky-200/80 px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
              />
            </div>
          )}

          {template === 'wifi' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Wifi className="h-3.5 w-3.5 text-sky-500" /> Network Name (SSID)
                </label>
                <input
                  type="text"
                  value={wifi.ssid}
                  onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                  className="w-full rounded-2xl bg-sky-50/50 border border-sky-200/80 px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                  <input
                    type="text"
                    value={wifi.pass}
                    onChange={(e) => setWifi({ ...wifi, pass: e.target.value })}
                    className="w-full rounded-2xl bg-sky-50/50 border border-sky-200/80 px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Security</label>
                  <select
                    value={wifi.auth}
                    onChange={(e) => setWifi({ ...wifi, auth: e.target.value })}
                    className="w-full rounded-2xl bg-sky-50/50 border border-sky-200/80 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 transition"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {template === 'vcard' && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={vcard.name}
                    onChange={(e) => setVcard({ ...vcard, name: e.target.value })}
                    className="w-full rounded-2xl bg-sky-50/50 border border-sky-200/80 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={vcard.phone}
                    onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                    className="w-full rounded-2xl bg-sky-50/50 border border-sky-200/80 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={vcard.email}
                    onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                    className="w-full rounded-2xl bg-sky-50/50 border border-sky-200/80 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Company</label>
                  <input
                    type="text"
                    value={vcard.org}
                    onChange={(e) => setVcard({ ...vcard, org: e.target.value })}
                    className="w-full rounded-2xl bg-sky-50/50 border border-sky-200/80 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {template === 'whatsapp' && (
            <div className="space-y-2.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number (with Country Code)</label>
                <input
                  type="text"
                  value={whatsapp.phone}
                  onChange={(e) => setWhatsapp({ ...whatsapp, phone: e.target.value })}
                  placeholder="+923001234567"
                  className="w-full rounded-2xl bg-sky-50/50 border border-sky-200/80 px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pre-filled Chat Message</label>
                <textarea
                  value={whatsapp.text}
                  onChange={(e) => setWhatsapp({ ...whatsapp, text: e.target.value })}
                  rows={2}
                  className="w-full rounded-2xl bg-sky-50/50 border border-sky-200/80 p-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>
            </div>
          )}

          {template === 'email' && (
            <div className="space-y-2.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={email.to}
                  onChange={(e) => setEmail({ ...email, to: e.target.value })}
                  className="w-full rounded-2xl bg-sky-50/50 border border-sky-200/80 px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  value={email.subject}
                  onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                  className="w-full rounded-2xl bg-sky-50/50 border border-sky-200/80 px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>
            </div>
          )}

          {template === 'phone' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
                className="w-full rounded-2xl bg-sky-50/50 border border-sky-200/80 px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
              />
            </div>
          )}

          {template === 'text' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Plain Text or Note</label>
              <textarea
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                rows={3}
                className="w-full rounded-2xl bg-sky-50/50 border border-sky-200/80 p-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
              />
            </div>
          )}

          {/* Color Palette Selector */}
          <div className="flex items-center justify-between pt-2 border-t border-sky-100">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-sky-500" /> Accent Color
            </span>
            <div className="flex items-center gap-1.5">
              {colorPalettes.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setActiveColor(c.hex)}
                  className={`h-6 w-6 rounded-full transition-all duration-200 ${
                    activeColor === c.hex ? 'ring-2 ring-sky-400 ring-offset-2 scale-110 shadow-sm' : 'opacity-80 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Live QR Preview Card */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-white border border-sky-100 space-y-5 shadow-sm">
        <div className="relative p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl border border-sky-200/60 shadow-inner flex items-center justify-center">
          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt="QR Code Preview"
              className="w-52 h-52 rounded-xl shadow-xs transition-transform duration-300 hover:scale-105"
            />
          )}
        </div>

        <div className="w-full space-y-2">
          <button
            onClick={handleDownloadPng}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 py-3.5 text-xs font-bold text-white shadow-md shadow-sky-500/25 hover:-translate-y-0.5 transition-all"
          >
            <Download className="h-4 w-4" /> Download PNG
          </button>
          <button
            onClick={handleCopyImage}
            className="w-full flex items-center justify-center gap-1.5 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200/70 py-3 text-xs font-bold text-sky-800 hover:-translate-y-0.5 transition-all"
          >
            {copied ? <Check className="h-4 w-4 text-sky-600" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Image'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
