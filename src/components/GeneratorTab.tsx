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
  MessageSquare,
  Copy,
  Check,
  Palette,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import QRCode from 'qrcode';

type Template = 'url' | 'wifi' | 'vcard' | 'whatsapp' | 'email' | 'phone' | 'sms' | 'text';

export const GeneratorTab: React.FC = () => {
  const [template, setTemplate] = useState<Template>('url');
  const [copied, setCopied] = useState(false);

  // Styling Customizer State
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrSvg, setQrSvg] = useState('');

  // Form Field States
  const [url, setUrl] = useState('https://github.com/Shaayan-shah/ScanDesk');
  const [wifi, setWifi] = useState({ ssid: 'Office_Guest', pass: 'Network2026', auth: 'WPA', hidden: false });
  const [vcard, setVcard] = useState({
    name: 'Shayan Shah',
    phone: '+923001234567',
    email: 'shayan@example.com',
    org: 'DecodeLabs',
    title: 'Software Architect',
  });
  const [whatsapp, setWhatsapp] = useState({ phone: '+923001234567', text: 'Hello, I scanned your QR code!' });
  const [email, setEmail] = useState({ to: 'contact@example.com', subject: 'Inquiry', body: 'Hello Shayan,' });
  const [phoneNum, setPhoneNum] = useState('+923001234567');
  const [sms, setSms] = useState({ phone: '+923001234567', message: 'Hello!' });
  const [plainText, setPlainText] = useState('Welcome to ScanDesk Optical Suite');

  const colorPalettes = [
    { label: 'Obsidian', hex: '#0f172a' },
    { label: 'Emerald', hex: '#059669' },
    { label: 'Sapphire', hex: '#2563eb' },
    { label: 'Crimson', hex: '#dc2626' },
    { label: 'Amethyst', hex: '#7c3aed' },
    { label: 'Amber', hex: '#d97706' },
  ];

  const getPayloadString = (): string => {
    switch (template) {
      case 'url':
        return url.startsWith('http') ? url : `https://${url}`;
      case 'wifi':
        return `WIFI:T:${wifi.auth};S:${wifi.ssid};P:${wifi.pass};${wifi.hidden ? 'H:true;' : ''};`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcard.name}\nTEL:${vcard.phone}\nEMAIL:${vcard.email}\nORG:${vcard.org}\nTITLE:${vcard.title}\nEND:VCARD`;
      case 'whatsapp':
        return `https://wa.me/${whatsapp.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsapp.text)}`;
      case 'email':
        return `mailto:${email.to}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
      case 'phone':
        return `tel:${phoneNum}`;
      case 'sms':
        return `smsto:${sms.phone}:${sms.message}`;
      case 'text':
      default:
        return plainText;
    }
  };

  useEffect(() => {
    const payload = getPayloadString();

    QRCode.toDataURL(payload, {
      width: 600,
      margin: 2,
      errorCorrectionLevel: errorCorrection,
      color: { dark: fgColor, light: bgColor },
    })
      .then(setQrDataUrl)
      .catch(() => {});

    QRCode.toString(payload, {
      type: 'svg',
      margin: 2,
      errorCorrectionLevel: errorCorrection,
      color: { dark: fgColor, light: bgColor },
    })
      .then(setQrSvg)
      .catch(() => {});
  }, [template, url, wifi, vcard, whatsapp, email, phoneNum, sms, plainText, fgColor, bgColor, errorCorrection]);

  const handleDownloadPng = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `scandesk_${template}_qr.png`;
    a.click();
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([qrSvg], { type: 'image/svg+xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scandesk_${template}_qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
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
      alert('Could not copy image to clipboard in this browser.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-4xl mx-auto">
      {/* Left Column: Form & Style Controls */}
      <div className="lg:col-span-7 space-y-4">
        {/* Template Switcher Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
          {[
            { id: 'url', label: 'Link', icon: Link },
            { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
            { id: 'vcard', label: 'Contact', icon: User },
            { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
            { id: 'email', label: 'Email', icon: Mail },
            { id: 'phone', label: 'Phone', icon: Phone },
            { id: 'sms', label: 'SMS', icon: MessageSquare },
            { id: 'text', label: 'Note', icon: FileText },
          ].map((t) => {
            const Icon = t.icon;
            const isSel = template === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id as Template)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border text-xs font-semibold transition ${
                  isSel
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                    : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[11px]">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Form Fields */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 space-y-3 shadow-xs">
          {template === 'url' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Target Web URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
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
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                  <input
                    type="text"
                    value={wifi.pass}
                    onChange={(e) => setWifi({ ...wifi, pass: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Security Type</label>
                  <select
                    value={wifi.auth}
                    onChange={(e) => setWifi({ ...wifi, auth: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-900"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">Open (No Password)</option>
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
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={vcard.phone}
                    onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={vcard.email}
                    onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Company / Org</label>
                  <input
                    type="text"
                    value={vcard.org}
                    onChange={(e) => setVcard({ ...vcard, org: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {template === 'whatsapp' && (
            <div className="space-y-2.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp Phone (with Country Code)</label>
                <input
                  type="text"
                  value={whatsapp.phone}
                  onChange={(e) => setWhatsapp({ ...whatsapp, phone: e.target.value })}
                  placeholder="+923001234567"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pre-filled Chat Message</label>
                <textarea
                  value={whatsapp.text}
                  onChange={(e) => setWhatsapp({ ...whatsapp, text: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-900 focus:outline-none"
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
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  value={email.subject}
                  onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900"
                />
              </div>
            </div>
          )}

          {template === 'phone' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number to Call</label>
              <input
                type="tel"
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900"
              />
            </div>
          )}

          {template === 'sms' && (
            <div className="space-y-2.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={sms.phone}
                  onChange={(e) => setSms({ ...sms, phone: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">SMS Message</label>
                <input
                  type="text"
                  value={sms.message}
                  onChange={(e) => setSms({ ...sms, message: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-900"
                />
              </div>
            </div>
          )}

          {template === 'text' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Plain Text or Encrypted Note</label>
              <textarea
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                rows={3}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-900 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Visual Studio Customizer (Color & Error Correction) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Palette className="h-4 w-4 text-emerald-600" /> Color Accent
            </span>
            <div className="flex items-center gap-1.5">
              {colorPalettes.map((p) => (
                <button
                  key={p.hex}
                  onClick={() => setFgColor(p.hex)}
                  className={`h-6 w-6 rounded-full border transition ${
                    fgColor === p.hex ? 'ring-2 ring-emerald-500 scale-110' : 'border-transparent opacity-80'
                  }`}
                  style={{ backgroundColor: p.hex }}
                  title={p.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-600 font-semibold">Error Correction</span>
            <div className="flex gap-1">
              {(['L', 'M', 'Q', 'H'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setErrorCorrection(lvl)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                    errorCorrection === lvl ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: QR Code Preview & Multi-Export */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner flex items-center justify-center">
          {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="w-52 h-52 rounded-xl" />}
        </div>

        <div className="w-full space-y-2">
          <button
            onClick={handleDownloadPng}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition"
          >
            <Download className="h-4 w-4" /> Download PNG
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadSvg}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 py-2.5 text-xs font-bold text-slate-700 transition"
            >
              <Download className="h-3.5 w-3.5" /> Vector SVG
            </button>
            <button
              onClick={handleCopyImage}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 py-2.5 text-xs font-bold text-slate-700 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Image'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


