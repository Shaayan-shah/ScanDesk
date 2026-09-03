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
} from 'lucide-react';
import QRCode from 'qrcode';

type Template = 'url' | 'wifi' | 'vcard' | 'whatsapp' | 'email' | 'phone' | 'text';

export const GeneratorTab: React.FC = () => {
  const [template, setTemplate] = useState<Template>('url');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Form Fields
  const [url, setUrl] = useState('https://github.com/Shaayan-shah/ScanDesk');
  const [wifi, setWifi] = useState({ ssid: 'Office_Guest', pass: 'Network2026', auth: 'WPA' });
  const [vcard, setVcard] = useState({
    name: 'Shayan Shah',
    phone: '+923001234567',
    email: 'shayan@example.com',
    org: 'DecodeLabs',
  });
  const [whatsapp, setWhatsapp] = useState({ phone: '+923001234567', text: 'Hello, I scanned your QR code!' });
  const [email, setEmail] = useState({ to: 'contact@example.com', subject: 'Inquiry', body: 'Hello,' });
  const [phoneNum, setPhoneNum] = useState('+923001234567');
  const [plainText, setPlainText] = useState('ScanDesk QR Suite');

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
      width: 500,
      margin: 2,
      color: { dark: '#18181b', light: '#ffffff' },
    })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [template, url, wifi, vcard, whatsapp, email, phoneNum, plainText]);

  const handleDownloadPng = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `scandesk_qr_${Date.now()}.png`;
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
      alert('Could not copy image directly on this device.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-4xl mx-auto">
      {/* Form Fields */}
      <div className="lg:col-span-7 space-y-3">
        {/* Template Buttons */}
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
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition ${
                  isSel
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white border border-zinc-200/80 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[10px]">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Container */}
        <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 space-y-3 shadow-xs">
          {template === 'url' && (
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1">Website URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-400 transition"
              />
            </div>
          )}

          {template === 'wifi' && (
            <div className="space-y-2.5">
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Network Name (SSID)</label>
                <input
                  type="text"
                  value={wifi.ssid}
                  onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                  className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">Password</label>
                  <input
                    type="text"
                    value={wifi.pass}
                    onChange={(e) => setWifi({ ...wifi, pass: e.target.value })}
                    className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">Security</label>
                  <select
                    value={wifi.auth}
                    onChange={(e) => setWifi({ ...wifi, auth: e.target.value })}
                    className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-xs text-zinc-900"
                  >
                    <option value="WPA">WPA/WPA2/WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {template === 'vcard' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">Name</label>
                  <input
                    type="text"
                    value={vcard.name}
                    onChange={(e) => setVcard({ ...vcard, name: e.target.value })}
                    className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={vcard.phone}
                    onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                    className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={vcard.email}
                    onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                    className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">Organization</label>
                  <input
                    type="text"
                    value={vcard.org}
                    onChange={(e) => setVcard({ ...vcard, org: e.target.value })}
                    className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {template === 'whatsapp' && (
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Phone Number (with Country Code)</label>
                <input
                  type="text"
                  value={whatsapp.phone}
                  onChange={(e) => setWhatsapp({ ...whatsapp, phone: e.target.value })}
                  placeholder="+923001234567"
                  className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Message</label>
                <textarea
                  value={whatsapp.text}
                  onChange={(e) => setWhatsapp({ ...whatsapp, text: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl bg-zinc-50 border border-zinc-200 p-2.5 text-xs text-zinc-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {template === 'email' && (
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={email.to}
                  onChange={(e) => setEmail({ ...email, to: e.target.value })}
                  className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Subject</label>
                <input
                  type="text"
                  value={email.subject}
                  onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                  className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900"
                />
              </div>
            </div>
          )}

          {template === 'phone' && (
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
                className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3.5 py-2 text-xs text-zinc-900"
              />
            </div>
          )}

          {template === 'text' && (
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1">Message Content</label>
              <textarea
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                rows={3}
                className="w-full rounded-xl bg-zinc-50 border border-zinc-200 p-2.5 text-xs text-zinc-900 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* QR Code Preview */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-white border border-zinc-200/80 space-y-4 shadow-xs">
        <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-center">
          {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-lg" />}
        </div>

        <div className="w-full flex gap-2">
          <button
            onClick={handleDownloadPng}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 py-3 text-xs font-semibold text-white shadow-xs transition"
          >
            <Download className="h-3.5 w-3.5" /> Download
          </button>
          <button
            onClick={handleCopyImage}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 py-3 text-xs font-semibold text-zinc-800 transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-zinc-900" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
