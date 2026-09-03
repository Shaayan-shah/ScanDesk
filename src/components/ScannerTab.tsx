import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, UploadCloud, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
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
        console.warn('Camera access error:', err);
        setCameraActive(false);
        setErrorMsg('Camera permission not granted or camera not detected. You can still scan from photos below!');
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

          // Prevent rapid duplicate trigger
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
      alert('Could not decode a QR code from this image. Please ensure the QR code is clearly visible and well-lit.');
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Hidden offscreen processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Viewfinder Card */}
      <div className="relative aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
        <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

        {/* Viewfinder Reticle Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
          <div className="relative w-64 h-64 rounded-3xl border-2 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
            <div className="absolute -top-1 -left-1 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
            <div className="absolute -top-1 -right-1 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
            <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-laser shadow-[0_0_10px_#22d3ee]" />
          </div>
        </div>

        {/* Top Floating Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
          <span className="flex items-center gap-1.5 rounded-full bg-slate-950/80 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-emerald-400 border border-slate-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{cameraActive ? 'Scanner Active' : 'Ready'}</span>
          </span>
          <button
            onClick={() => setFacing(facing === 'environment' ? 'user' : 'environment')}
            className="rounded-full bg-slate-950/80 backdrop-blur-md p-2.5 text-slate-200 border border-slate-800 hover:text-emerald-400 transition shadow-sm"
            title="Switch Camera"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Error Notification Overlay if camera is blocked */}
        {errorMsg && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <Camera className="h-10 w-10 text-slate-500" />
            <p className="text-xs text-slate-300 max-w-xs">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* Gallery Photo Picker & Manual Input Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Device Photo Upload */}
        <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Scan from Photo</p>
              <p className="text-[10px] text-slate-400">Pick image from device gallery</p>
            </div>
          </div>
          <span className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-sm">
            Browse
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>

        {/* Manual Code Input Form */}
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Type or paste payload..."
            className="flex-1 rounded-xl bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-200 transition"
          >
            Decode
          </button>
        </form>
      </div>
    </div>
  );
};
