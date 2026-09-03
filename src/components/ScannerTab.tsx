import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Flashlight, Layers, Download, CheckCircle2, Sparkles, Scan, Crosshair } from 'lucide-react';
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

  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [batchMode, setBatchMode] = useState(false);
  const [batchItems, setBatchItems] = useState<ScanResult[]>([]);

  const streamRef = useRef<MediaStream | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const isScanningRef = useRef<boolean>(true);

  useEffect(() => {
    let animId: number;
    isScanningRef.current = true;

    const startCamera = async () => {
      try {
        setErrorMsg(null);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        streamRef.current = stream;

        const track = stream.getVideoTracks()[0];
        const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
        setHasTorch(!!capabilities.torch);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
          scanFrame();
        }
      } catch (err: any) {
        setCameraActive(false);
        setErrorMsg('Camera access is not available. Please pick an image from your device photos below.');
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

          const interval = batchMode ? 1200 : 1500;
          if (now - lastScanTimeRef.current > interval) {
            const result = ScannerDecoder.decodeCanvas(canvas);
            if (result) {
              lastScanTimeRef.current = now;
              triggerScanSuccess(result);
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facing, batchMode]);

  const triggerScanSuccess = (result: ScanResult) => {
    ScannerDecoder.playBeep();
    if ('vibrate' in navigator) {
      try { navigator.vibrate([40, 25, 40]); } catch {}
    }
    StorageService.saveScan(result);

    if (batchMode) {
      setBatchItems((prev) => [result, ...prev]);
    } else {
      onScanResult(result);
    }
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      const next = !torchOn;
      await track.applyConstraints({
        advanced: [{ torch: next } as any],
      });
      setTorchOn(next);
    } catch {
      setTorchOn(false);
    }
  };

  const handleZoom = async (level: number) => {
    setZoomLevel(level);
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ zoom: level } as any],
      });
    } catch {}
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const parsed = ContentParser.parse(manualInput.trim());
    triggerScanSuccess(parsed);
    setManualInput('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await ScannerDecoder.decodeImageFile(file);
    if (result) {
      triggerScanSuccess(result);
    } else {
      alert('Could not decode a QR code or barcode from this image. Please select a clearer photo.');
    }
    e.target.value = '';
  };

  const exportBatchCsv = () => {
    const headers = 'ID,Type,Format,Timestamp,Payload\n';
    const rows = batchItems
      .map((b) => `"${b.id}","${b.contentType}","${b.format}","${new Date(b.timestamp).toISOString()}","${b.rawValue.replace(/"/g, '""')}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scandesk_batch_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <canvas ref={canvasRef} className="hidden" />

      {/* Viewfinder Main Stage */}
      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-950 shadow-2xl shadow-sky-500/10 border-2 border-sky-200/80 flex items-center justify-center transition-all duration-300">
        <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

        {/* High-Tech Optical Target Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
          <div className="relative w-56 h-56 rounded-3xl border border-sky-400/40 shadow-[0_0_30px_rgba(56,189,248,0.25)] flex items-center justify-center">
            
            {/* 4 Corner Targeting Crosshairs */}
            <div className="absolute -top-1 -left-1 w-7 h-7 border-t-4 border-l-4 border-sky-400 rounded-tl-xl drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            <div className="absolute -top-1 -right-1 w-7 h-7 border-t-4 border-r-4 border-sky-400 rounded-tr-xl drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-4 border-l-4 border-sky-400 rounded-bl-xl drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-4 border-r-4 border-sky-400 rounded-br-xl drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />

            {/* Central Target Reticle */}
            <div className="w-6 h-6 rounded-full border border-sky-300/60 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            </div>

            {/* Animated Laser Beam */}
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-laser shadow-[0_0_12px_#38bdf8]" />
          </div>
        </div>

        {/* Top Control Bar with Glassmorphic Pills */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-slate-900/70 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white border border-white/10 shadow-lg">
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
              <span>{cameraActive ? (batchMode ? `Batch (${batchItems.length})` : 'Scanning') : 'Standby'}</span>
            </span>

            <button
              onClick={() => setBatchMode(!batchMode)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-300 ${
                batchMode
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/40 scale-105'
                  : 'bg-slate-900/70 backdrop-blur-md text-slate-200 hover:text-white border border-white/10'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Batch</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {hasTorch && (
              <button
                onClick={toggleTorch}
                className={`rounded-full p-2.5 transition-all duration-200 ${
                  torchOn
                    ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/40 scale-110'
                    : 'bg-slate-900/70 backdrop-blur-md text-white hover:text-sky-300 border border-white/10'
                }`}
                title="Toggle Torch"
              >
                <Flashlight className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => setFacing(facing === 'environment' ? 'user' : 'environment')}
              className="rounded-full bg-slate-900/70 backdrop-blur-md p-2.5 text-white hover:text-sky-300 hover:rotate-180 transition-all duration-500 border border-white/10"
              title="Flip Camera Lens"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bottom Digital Zoom Selector */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-lg pointer-events-auto">
          {[1, 2, 3].map((z) => (
            <button
              key={z}
              onClick={() => handleZoom(z)}
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full transition-all duration-200 ${
                zoomLevel === z
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs scale-105'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {z}x
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400">
              <Camera className="h-8 w-8 animate-bounce" />
            </div>
            <p className="text-xs text-slate-200 max-w-xs">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* Batch Mode Drawer Banner */}
      {batchMode && batchItems.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200/80 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white text-xs font-bold shadow-xs">
              {batchItems.length}
            </span>
            <div>
              <p className="text-xs font-bold text-sky-950">Batch Scan Active</p>
              <p className="text-[11px] text-sky-700">{batchItems.length} items logged</p>
            </div>
          </div>
          <button
            onClick={exportBatchCsv}
            className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white px-4 py-2 rounded-2xl font-bold shadow-md shadow-sky-500/25 hover:-translate-y-0.5 transition-all"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      )}

      {/* Photo Picker & Manual Input Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Photo Gallery Card */}
        <label className="group flex items-center justify-between p-4 rounded-3xl bg-white border border-sky-100 hover:border-sky-300 cursor-pointer shadow-sm hover:shadow-md hover:shadow-sky-500/10 hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 text-sky-600 border border-sky-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Upload className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">Import Photo</p>
              <p className="text-[11px] text-slate-500">Pick from gallery</p>
            </div>
          </div>
          <span className="rounded-xl bg-sky-50 group-hover:bg-sky-500 group-hover:text-white px-3 py-1.5 text-xs font-bold text-sky-700 border border-sky-200/60 transition-all">
            Select
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>

        {/* Text / Barcode Input Form */}
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2 p-2 rounded-3xl bg-white border border-sky-100 shadow-sm hover:border-sky-300 transition-all duration-300">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Paste code text..."
            className="flex-1 rounded-2xl bg-sky-50/50 px-3.5 py-2.5 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white border border-transparent focus:border-sky-400 transition"
          />
          <button
            type="submit"
            className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/20 hover:scale-105 transition-all"
          >
            Decode
          </button>
        </form>
      </div>
    </div>
  );
};
