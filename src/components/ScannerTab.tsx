import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Flashlight, ZoomIn, Layers, Download, Check, Sparkles } from 'lucide-react';
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

  // Advanced Optical Controls
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [batchMode, setBatchMode] = useState(false);
  const [batchItems, setBatchItems] = useState<ScanResult[]>([]);
  const [showBatchDrawer, setShowBatchDrawer] = useState(false);

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

        // Check torch / zoom capabilities
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
        setErrorMsg('Camera access is restricted. Use the photo picker below to decode any image or barcode.');
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

          // Scan interval (1.2s for batch mode, 1.5s for normal)
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
      try { navigator.vibrate([40, 20, 40]); } catch {}
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
    const headers = 'ID,Type,Format,Timestamp,Raw Value\n';
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

        {/* Top Viewfinder Toolbar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{cameraActive ? (batchMode ? `Batch (${batchItems.length})` : 'Active') : 'Ready'}</span>
            </span>

            <button
              onClick={() => setBatchMode(!batchMode)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition ${
                batchMode
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-black/60 backdrop-blur-md text-slate-300 hover:text-white'
              }`}
              title="Continuous Multi-Scan Batch Mode"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Batch</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {hasTorch && (
              <button
                onClick={toggleTorch}
                className={`rounded-full p-2 transition ${
                  torchOn ? 'bg-amber-400 text-slate-900 shadow-md shadow-amber-400/40' : 'bg-black/60 backdrop-blur-md text-white'
                }`}
                title="Toggle Torch"
              >
                <Flashlight className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => setFacing(facing === 'environment' ? 'user' : 'environment')}
              className="rounded-full bg-black/60 backdrop-blur-md p-2 text-white hover:text-emerald-400 transition"
              title="Switch Lens"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bottom Zoom Selector on Viewfinder */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full pointer-events-auto">
          {[1, 2, 3].map((z) => (
            <button
              key={z}
              onClick={() => handleZoom(z)}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition ${
                zoomLevel === z ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              {z}x
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center space-y-2">
            <Camera className="h-8 w-8 text-slate-400" />
            <p className="text-xs text-slate-200">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* Batch Mode Active Banner */}
      {batchMode && batchItems.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
              {batchItems.length}
            </span>
            <span className="text-xs font-bold text-emerald-900">Batch Scans Collected</span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setShowBatchDrawer(!showBatchDrawer)}
              className="text-xs bg-white text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl font-bold hover:bg-emerald-100 transition"
            >
              {showBatchDrawer ? 'Hide' : 'Review'}
            </button>
            <button
              onClick={exportBatchCsv}
              className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-xl font-bold shadow-xs hover:bg-emerald-700 transition flex items-center gap-1"
            >
              <Download className="h-3 w-3" /> Export CSV
            </button>
          </div>
        </div>
      )}

      {/* Batch Items Review List */}
      {showBatchDrawer && batchItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2 max-h-48 overflow-y-auto shadow-xs">
          {batchItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => onScanResult(item)}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50 cursor-pointer transition text-xs"
            >
              <span className="font-mono text-slate-800 truncate pr-2">#{idx + 1} {item.rawValue}</span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase shrink-0">{item.contentType}</span>
            </div>
          ))}
        </div>
      )}

      {/* Photo Picker & Manual Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/50 cursor-pointer transition shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Upload className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Upload Photo</p>
              <p className="text-[11px] text-slate-500">Pick from device storage</p>
            </div>
          </div>
          <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
            Browse
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>

        <form onSubmit={handleManualSubmit} className="flex items-center gap-2 p-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Paste code payload..."
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


