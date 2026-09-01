import React, { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, Zap, ZapOff, ShieldAlert, Sparkles, Video } from "lucide-react";
import { ScanResult, BarcodeFormat } from "../../types";
import { ContentParser } from "../../services/parser/contentParser";
import { ScannerEngine } from "../../services/scanner/scannerEngine";
import { HistoryRepository } from "../../services/storage/historyRepository";

interface CameraScannerProps {
  onScanResult: (result: ScanResult) => void;
  duplicateCooldownMs?: number;
  soundEnabled?: boolean;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onScanResult,
  duplicateCooldownMs = 1500,
  soundEnabled = true
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [lastScanned, setLastScanned] = useState<{ value: string; time: number } | null>(null);
  const [manualInput, setManualInput] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setHasPermission(true);
          scanFrameLoop();
        }
      } catch (err) {
        console.warn("Camera initialization error:", err);
        setHasPermission(false);
      }
    };

    const scanFrameLoop = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        if ("BarcodeDetector" in window) {
          try {
            const detector = new (window as any).BarcodeDetector({
              formats: ["qr_code", "ean_13", "ean_8", "upc_a", "code_128", "code_39", "data_matrix"]
            });
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0];
              const now = Date.now();

              // Duplicate suppression window check
              if (!lastScanned || lastScanned.value !== code.rawValue || now - lastScanned.time > duplicateCooldownMs) {
                setLastScanned({ value: code.rawValue, time: now });
                if (soundEnabled) ScannerEngine.playBeep();
                const parsed = ContentParser.parse(code.rawValue, code.format as BarcodeFormat, "camera");
                await HistoryRepository.saveScan(parsed);
                onScanResult(parsed);
              }
            }
          } catch (err) {
            // Frame detection error
          }
        }
      }
      animationFrameId = requestAnimationFrame(scanFrameLoop);
    };

    startCamera();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode, duplicateCooldownMs, soundEnabled]);

  const toggleTorch = async () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      try {
        await (track as any).applyConstraints({
          advanced: [{ torch: !torchOn }]
        });
        setTorchOn(!torchOn);
      } catch {
        // Torch not supported on current camera
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const parsed = ContentParser.parse(manualInput.trim(), "qr_code", "camera");
    HistoryRepository.saveScan(parsed);
    onScanResult(parsed);
    setManualInput("");
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 max-w-2xl mx-auto">
      {/* Viewfinder Card */}
      <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl card-3d-wrap">
        {hasPermission === false ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950/90">
            <ShieldAlert className="h-10 w-10 text-amber-400" />
            <h3 className="text-base font-semibold text-white">Camera Access Required</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Please grant camera permission in your browser to scan barcodes live, or use the manual input below.
            </p>
          </div>
        ) : (
          <>
            <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl border-2 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                {/* Animated Laser Bar */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee] animate-scan-laser" />
              </div>
            </div>

            {/* Floating Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-1.5 rounded-full bg-slate-950/70 backdrop-blur-md px-3 py-1 text-xs text-emerald-400 border border-slate-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Viewfinder</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTorch}
                  className="rounded-full bg-slate-950/70 backdrop-blur-md p-2.5 text-slate-200 border border-slate-800 hover:text-amber-400 transition"
                  title="Toggle Flashlight"
                >
                  {torchOn ? <Zap className="h-4 w-4 text-amber-400" /> : <ZapOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setFacingMode(facingMode === "environment" ? "user" : "environment")}
                  className="rounded-full bg-slate-950/70 backdrop-blur-md p-2.5 text-slate-200 border border-slate-800 hover:text-emerald-400 transition"
                  title="Switch Camera"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Manual Input Fallback */}
      <form onSubmit={handleManualSubmit} className="w-full flex gap-2">
        <input
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="Paste or type raw QR/barcode value..."
          className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition"
        >
          Parse Value
        </button>
      </form>
    </div>
  );
};
