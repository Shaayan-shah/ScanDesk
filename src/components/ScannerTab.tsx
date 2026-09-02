import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, UploadCloud, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { ScanResult, BarcodeFormat } from '../types';
import { ContentParser } from '../services/parser';
import { StorageService } from '../services/storage';

interface ScannerTabProps {
  onScanResult: (result: ScanResult) => void;
}

export const ScannerTab: React.FC<ScannerTabProps> = ({ onScanResult }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');
  const [manualInput, setManualInput] = useState('');
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setHasCamera(true);
          scanLoop();
        }
      } catch {
        setHasCamera(false);
      }
    };

    const scanLoop = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2 && 'BarcodeDetector' in window) {
        try {
          const detector = new (window as any).BarcodeDetector({
            formats: ['qr_code', 'ean_13', 'upc_a', 'code_128', 'code_39']
          });
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const code = barcodes[0];
            const parsed = ContentParser.parse(code.rawValue, code.format as BarcodeFormat);
            StorageService.saveScan(parsed);
            onScanResult(parsed);
          }
        } catch {}
      }
      animId = requestAnimationFrame(scanLoop);
    };

    startCamera();

    return () => {
      cancelAnimationFrame(animId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const parsed = ContentParser.parse(manualInput.trim());
    StorageService.saveScan(parsed);
    onScanResult(parsed);
    setManualInput('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const bmp = await createImageBitmap(file);
    if ('BarcodeDetector' in window) {
      try {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128'] });
        const res = await detector.detect(bmp);
        if (res.length > 0) {
          const parsed = ContentParser.parse(res[0].rawValue, res[0].format as BarcodeFormat);
          StorageService.saveScan(parsed);
          onScanResult(parsed);
        } else {
          alert('No QR or barcode detected in this image.');
        }
      } catch {
        alert('Image decoding failed.');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Viewfinder Card */}
      <div className="relative aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
        {hasCamera === false ? (
          <div className="p-6 text-center space-y-3">
            <Camera className="h-10 w-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">Camera Unavailable or Permission Pending</p>
            <p className="text-xs text-slate-500 max-w-xs">
              Use the photo picker or manual input below to scan codes instantly.
            </p>
          </div>
        ) : (
          <>
            <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

            {/* Target Reticle */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
              <div className="relative w-64 h-64 rounded-3xl border-2 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-laser shadow-[0_0_8px_#22d3ee]" />
              </div>
            </div>

            {/* Viewfinder Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
              <span className="flex items-center gap-1.5 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-emerald-400 border border-slate-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Scanner
              </span>
              <button
                onClick={() => setFacing(facing === 'environment' ? 'user' : 'environment')}
                className="rounded-full bg-slate-950/80 p-2.5 text-slate-300 border border-slate-800 hover:text-emerald-400 transition"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Gallery & Manual Input Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition">
          <div className="flex items-center gap-3">
            <UploadCloud className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-white">Scan from Photo</p>
              <p className="text-[10px] text-slate-400">Pick image from gallery</p>
            </div>
          </div>
          <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">Upload</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>

        <form onSubmit={handleManualSubmit} className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Paste code text..."
            className="flex-1 rounded-xl bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
          />
          <button type="submit" className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400">
            Parse
          </button>
        </form>
      </div>
    </div>
  );
};
