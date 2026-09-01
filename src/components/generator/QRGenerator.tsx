import React, { useState, useEffect } from 'react';
import { QrCode, Download, ShieldCheck, Wifi, UserPlus, Link, FileText, Phone, Mail } from 'lucide-react';
import { QRGeneratorService } from '../../services/generator/qrGenerator';

type TemplateType = 'url' | 'wifi' | 'vcard' | 'text' | 'phone' | 'email';

export const QRGenerator: React.FC = () => {
  const [template, setTemplate] = useState<TemplateType>('url');
  const [payload, setPayload] = useState('https://github.com/Shaayan-shah');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isVerified, setIsVerified] = useState(false);
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#ffffff');

  const [wifiData, setWifiData] = useState({ ssid: '', password: '', auth: 'WPA' });
  const [vcardData, setVcardData] = useState({ name: '', phone: '', email: '', org: '' });
  const [phoneData, setPhoneData] = useState('');
  const [emailData, setEmailData] = useState({ to: '', subject: '', body: '' });

  useEffect(() => {
    let generatedString = payload;
    if (template === 'wifi') {
      generatedString = 'WIFI:T:' + wifiData.auth + ';S:' + wifiData.ssid + ';P:' + wifiData.password + ';;';
    } else if (template === 'vcard') {
      generatedString = 'BEGIN:VCARD\nVERSION:3.0\nFN:' + vcardData.name + '\nTEL:' + vcardData.phone + '\nEMAIL:' + vcardData.email + '\nORG:' + vcardData.org + '\nEND:VCARD';
    } else if (template === 'phone') {
      generatedString = 'tel:' + phoneData;
    } else if (template === 'email') {
      generatedString = 'mailto:' + emailData.to + '?subject=' + encodeURIComponent(emailData.subject) + '&body=' + encodeURIComponent(emailData.body);
    }

    const buildQR = async () => {
      const { dataUrl, isVerified: verified } = await QRGeneratorService.generateAndVerify(generatedString, {
        color: { dark: darkColor, light: lightColor }
      });
      setQrDataUrl(dataUrl);
      setIsVerified(verified);
    };

    buildQR();
  }, [template, payload, wifiData, vcardData, phoneData, emailData, darkColor, lightColor]);

  const handleDownloadPNG = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'scandesk_qr_' + Date.now() + '.png';
    a.click();
  };

  return (
    <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto'>
      <div className='lg:col-span-7 space-y-6'>
        <div className='grid grid-cols-3 sm:grid-cols-6 gap-2'>
          {[
            { id: 'url', label: 'Safe Link', icon: Link },
            { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
            { id: 'vcard', label: 'Contact', icon: UserPlus },
            { id: 'text', label: 'Plain Text', icon: FileText },
            { id: 'phone', label: 'Phone', icon: Phone },
            { id: 'email', label: 'Email', icon: Mail },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = template === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id as TemplateType)}
                className={'flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-medium transition ' + (isSelected ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400')}
              >
                <Icon className='h-4 w-4' />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className='p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4'>
          {template === 'url' && (
            <div>
              <label className='text-xs font-semibold text-slate-300 block mb-2'>Target Safe URL</label>
              <input
                type='url'
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder='https://example.com'
                className='w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500'
              />
            </div>
          )}

          {template === 'wifi' && (
            <div className='space-y-3'>
              <div>
                <label className='text-xs font-semibold text-slate-300 block mb-1'>Network SSID</label>
                <input
                  type='text'
                  value={wifiData.ssid}
                  onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                  placeholder='MyHomeWiFi'
                  className='w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500'
                />
              </div>
              <div>
                <label className='text-xs font-semibold text-slate-300 block mb-1'>Password</label>
                <input
                  type='text'
                  value={wifiData.password}
                  onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                  placeholder='SecretPassword123'
                  className='w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500'
                />
              </div>
            </div>
          )}

          {template === 'vcard' && (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='text-xs font-semibold text-slate-300 block mb-1'>Full Name</label>
                <input
                  type='text'
                  value={vcardData.name}
                  onChange={(e) => setVcardData({ ...vcardData, name: e.target.value })}
                  placeholder='Shayan Shah'
                  className='w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500'
                />
              </div>
              <div>
                <label className='text-xs font-semibold text-slate-300 block mb-1'>Phone</label>
                <input
                  type='text'
                  value={vcardData.phone}
                  onChange={(e) => setVcardData({ ...vcardData, phone: e.target.value })}
                  placeholder='+92 300 1234567'
                  className='w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500'
                />
              </div>
            </div>
          )}

          {template === 'text' && (
            <div>
              <label className='text-xs font-semibold text-slate-300 block mb-2'>Raw Text Payload</label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={3}
                className='w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500'
              />
            </div>
          )}

          <div className='pt-2 border-t border-slate-800/80 flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <label className='text-xs text-slate-400'>Foreground:</label>
              <input type='color' value={darkColor} onChange={(e) => setDarkColor(e.target.value)} className='h-6 w-6 rounded bg-transparent cursor-pointer' />
            </div>
            <div className='flex items-center gap-2'>
              <label className='text-xs text-slate-400'>Background:</label>
              <input type='color' value={lightColor} onChange={(e) => setLightColor(e.target.value)} className='h-6 w-6 rounded bg-transparent cursor-pointer' />
            </div>
          </div>
        </div>
      </div>

      <div className='lg:col-span-5 flex flex-col items-center justify-center space-y-5'>
        <div className='card-3d-wrap w-full max-w-sm'>
          <div className='card-3d-content rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl flex flex-col items-center space-y-6'>
            <div className='flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20 shadow-sm'>
              <ShieldCheck className='h-3.5 w-3.5' />
              <span>{isVerified ? 'Self-Verified Decodable 100%' : 'Generating...'}</span>
            </div>

            <div className='p-4 rounded-2xl bg-white shadow-inner'>
              {qrDataUrl && <img src={qrDataUrl} alt='Generated QR' className='w-56 h-56 rounded-lg object-contain' />}
            </div>

            <button
              onClick={handleDownloadPNG}
              className='w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md'
            >
              <Download className='h-4 w-4' /> Download PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
