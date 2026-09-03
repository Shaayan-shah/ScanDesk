import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Flashlight, Layers, Download } from 'lucide-react';
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
        setErrorMsg('Camera access is not available. You can upload an image from your gallery below.');
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
      try { navigator.vibrate([30, 20, 30]); } catch {}
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
      alert('Could not read a code from this image. Please choose a well-lit photo.');
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

      {/* Viewfinder Card */}
      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-950 shadow-md border border-zinc-200/80 flex items-center justify-center">
        <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

        {/* Framing Reticle */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
          <div className="relative w-52 h-52 rounded-2xl border border-white/20">
            <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-white rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-white rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-white rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-white rounded-br-lg" />
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-laser" />
          </div>
        </div>

        {/* Viewfinder Controls */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setBatchMode(!batchMode)}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
                batchMode
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'bg-black/40 backdrop-blur-md text-white/90 hover:bg-black/60'
              }`}
            >
              <Layers className="h-3 w-3" />
              <span>{batchMode ? `Batch (${batchItems.length})` : 'Single'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {hasTorch && (
              <button
                onClick={toggleTorch}
                className={`rounded-full p-2 transition ${
                  torchOn ? 'bg-white text-zinc-900' : 'bg-black/40 backdrop-blur-md text-white hover:bg-black/60'
                }`}
                title="Toggle Torch"
              >
                <Flashlight className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              onClick={() => setFacing(facing === 'environment' ? 'user' : 'environment')}
              className="rounded-full bg-black/40 backdrop-blur-md p-2 text-white hover:bg-black/60 transition"
              title="Switch Camera"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Zoom Selector */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full pointer-events-auto">
          {[1, 2, 3].map((z) => (
            <button
              key={z}
              onClick={() => handleZoom(z)}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition ${
                zoomLevel === z ? 'bg-white text-zinc-900' : 'text-white/80 hover:text-white'
              }`}
            >
              {z}x
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="absolute inset-0 bg-zinc-900/90 flex flex-col items-center justify-center p-6 text-center space-y-2">
            <Camera className="h-8 w-8 text-zinc-400" />
            <p className="text-xs text-zinc-200">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* Batch Mode Drawer Banner */}
      {batchMode && batchItems.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-100 border border-zinc-200 shadow-xs">
          <span className="text-xs font-semibold text-zinc-800">
            {batchItems.length} {batchItems.length === 1 ? 'code' : 'codes'} collected
          </span>
          <button
            onClick={exportBatchCsv}
            className="flex items-center gap-1 text-xs bg-zinc-900 text-white px-3 py-1.5 rounded-xl font-medium shadow-xs hover:bg-zinc-800 transition"
          >
            <Download className="h-3 w-3" /> Export CSV
          </button>
        </div>
      )}

      {/* Photo Picker & Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 cursor-pointer transition shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-100 text-zinc-700">
              <Upload className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-900">Import Image</p>
              <p className="text-[11px] text-zinc-500">Pick from device photos</p>
            </div>
          </div>
          <span className="rounded-xl bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">Browse</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>

        <form onSubmit={handleManualSubmit} className="flex items-center gap-1.5 p-2 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Paste code or text..."
            className="flex-1 rounded-xl bg-zinc-50 px-3 py-2 text-xs font-mono text-zinc-800 focus:outline-none focus:bg-white border border-transparent focus:border-zinc-300 transition"
          />
          <button
            type="submit"
            className="rounded-xl bg-zinc-900 hover:bg-zinc-800 px-3.5 py-2 text-xs font-medium text-white transition"
          >
            Decode
          </button>
        </form>
      </div>
    </div>
  );
};
