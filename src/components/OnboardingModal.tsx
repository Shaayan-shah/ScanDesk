import React, { useState } from 'react';
import { Camera, Image, QrCode, ArrowRight, Check, Layers, ShieldCheck } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'Smart Optical Scanner',
      desc: 'Point your camera at any QR code, barcode, or URL for instant real-time decoding with flash & zoom support.',
      icon: Camera,
      badge: 'Feature 1 of 3',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Continuous Batch Scanning',
      desc: 'Switch to Batch mode to scan multiple items sequentially without closing the camera, then export directly to CSV.',
      icon: Layers,
      badge: 'Feature 2 of 3',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Pro QR Studio & Security',
      desc: 'Design custom branded QR codes for Wi-Fi, Contacts, and WhatsApp with real-time URL security analysis.',
      icon: QrCode,
      badge: 'Feature 3 of 3',
      color: 'from-violet-500 to-purple-600',
    },
  ];

  const current = slides[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('scandesk_onboarded', 'true');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
        {/* Top Progress & Badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            {current.badge}
          </span>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === i ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Feature Visual Icon */}
        <div className="flex justify-center py-4">
          <div className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${current.color} text-white shadow-lg shadow-emerald-500/10`}>
            <Icon className="h-10 w-10 stroke-[1.8]" />
          </div>
        </div>

        {/* Text Details */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-slate-900">{current.title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">{current.desc}</p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition"
        >
          <span>{step === slides.length - 1 ? 'Start Scanning' : 'Next'}</span>
          {step === slides.length - 1 ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};
