import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, CheckCircle2 } from 'lucide-react';
import { ScanResult } from '../types';
import { ContentParser } from '../services/parser';
import { StorageService } from '../services/storage';
import { ScannerDecoder } from '../services/decoder';

interface ScannerTabProps {
  onScanResult: (result: ScanResult) => void;
}

export const ScannerTab: React.FC<ScannerTabProps> = ({ onScanResult }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');
  const [manualInput, setManualInput] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const isScanningRef = useRef<boolean>(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animId: number;
    isScanningRef.current = true;

    const startCamera = async () => {
      try {
        setErrorMsg(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
          scanFrame();
        }
      } catch (err: any) {
        setCameraActive(false);
        setErrorMsg('Camera permission not granted. Use photo upload below to scan.');
      }
    };

    const scanFrame = () => {
      if (!isScanningRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const now = Date.now();

          if (now - lastScanTimeRef.current > 1500) {
            const result = ScannerDecoder.decodeCanvas(canvas);
            if (result) {
              lastScanTimeRef.current = now;
              ScannerDecoder.playBeep();
              StorageService.saveScan(result);
              onScanResult(result);
            }
          }
        }
      }

      animId = requestAnimationFrame(scanFrame);
    };

    startCamera();

    return () => {
      isScanningRef.current = false;
      cancelAnimationFrame(animId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const parsed = ContentParser.parse(manualInput.trim());
    ScannerDecoder.playBeep();
    StorageService.saveScan(parsed);
    onScanResult(parsed);
    setManualInput('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await ScannerDecoder.decodeImageFile(file);
    if (result) {
      ScannerDecoder.playBeep();
      StorageService.saveScan(result);
      onScanResult(result);
    } else {
      alert('No clear QR code detected in this photo. Please try a well-lit image.');
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Viewfinder Card */}
      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200/80 flex items-center justify-center">
        <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

        {/* Viewfinder Reticle Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
          <div className="relative w-56 h-56 rounded-3xl border-2 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-laser shadow-[0_0_8px_#34d399]" />
          </div>
        </div>

        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
          <span className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{cameraActive ? 'Scanning' : 'Camera Ready'}</span>
          </span>
          <button
            onClick={() => setFacing(facing === 'environment' ? 'user' : 'environment')}
            className="rounded-full bg-black/60 backdrop-blur-md p-2.5 text-white hover:text-emerald-400 transition"
            title="Switch Lens"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center space-y-2">
            <Camera className="h-8 w-8 text-slate-400" />
            <p className="text-xs text-slate-200">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* Gallery Picker & Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/50 cursor-pointer transition shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Upload className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Upload Photo</p>
              <p className="text-[11px] text-slate-500">Pick from phone gallery</p>
            </div>
          </div>
          <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
            Select
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>

        <form onSubmit={handleManualSubmit} className="flex items-center gap-2 p-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Paste code text..."
            className="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:bg-white border border-transparent focus:border-emerald-500 transition"
          />
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white transition"
          >
            Decode
          </button>
        </form>
      </div>
    </div>
  );
};

