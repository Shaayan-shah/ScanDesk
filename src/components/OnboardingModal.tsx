import React, { useState } from 'react';
import { Camera, Image, QrCode, ArrowRight, Check } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'Scan with Camera',
      desc: 'Point your camera at any QR code or retail barcode. The app recognizes and opens it automatically.',
      icon: Camera,
      badge: 'Step 1 of 3',
    },
    {
      title: 'Import from Photos',
      desc: 'Select saved screenshots or photos from your gallery to decode codes without pointing your camera.',
      icon: Image,
      badge: 'Step 2 of 3',
    },
    {
      title: 'Create & Share QR Codes',
      desc: 'Generate custom QR codes for Wi-Fi networks, contact cards, web links, or text in seconds.',
      icon: QrCode,
      badge: 'Step 3 of 3',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 space-y-5 shadow-xl border border-zinc-100">
        {/* Progress & Badge */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded-full">
            {current.badge}
          </span>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === i ? 'w-5 bg-zinc-900' : 'w-1.5 bg-zinc-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Feature Icon */}
        <div className="flex justify-center py-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 shadow-xs">
            <Icon className="h-7 w-7 stroke-[1.8]" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          <h3 className="text-base font-semibold text-zinc-900">{current.title}</h3>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">{current.desc}</p>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 py-3 text-xs font-semibold text-white transition shadow-sm"
        >
          <span>{step === slides.length - 1 ? 'Get Started' : 'Next'}</span>
          {step === slides.length - 1 ? <Check className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
};
