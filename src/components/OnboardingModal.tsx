import React, { useState } from 'react';
import { Camera, Image, QrCode, ArrowRight, Check, Sparkles, Layers } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'Real-Time Camera Scanner',
      desc: 'Point your camera at any QR code or barcode to decode web links, Wi-Fi networks, and contact cards instantly with flash and zoom.',
      icon: Camera,
      badge: 'Feature 1 of 3',
      color: 'from-sky-500 to-blue-600',
    },
    {
      title: 'Gallery & Photo Decoder',
      desc: 'Pick saved photos, screenshots, or receipts from your device gallery to scan codes without using your live camera.',
      icon: Image,
      badge: 'Feature 2 of 3',
      color: 'from-indigo-500 to-sky-500',
    },
    {
      title: 'Branded QR Studio',
      desc: 'Generate custom QR codes for your Wi-Fi, personal vCard, WhatsApp, or links with color choices and instant image download.',
      icon: QrCode,
      badge: 'Feature 3 of 3',
      color: 'from-sky-500 to-teal-500',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 sm:p-7 space-y-5 shadow-2xl border border-sky-100 animate-in zoom-in-95 duration-200">
        {/* Progress & Badge */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60">
            {current.badge}
          </span>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === i ? 'w-6 bg-gradient-to-r from-sky-500 to-blue-600' : 'w-2 bg-sky-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Feature Icon */}
        <div className="flex justify-center py-3">
          <div className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr ${current.color} text-white shadow-xl shadow-sky-500/20 animate-float`}>
            <Icon className="h-9 w-9 stroke-[1.8]" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          <h3 className="text-base font-bold text-slate-900">{current.title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">{current.desc}</p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 py-3.5 text-xs font-bold text-white shadow-md shadow-sky-500/25 hover:-translate-y-0.5 transition-all"
        >
          <span>{step === slides.length - 1 ? 'Start Scanning' : 'Next'}</span>
          {step === slides.length - 1 ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};
