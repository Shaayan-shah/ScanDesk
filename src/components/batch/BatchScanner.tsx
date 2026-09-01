import React, { useState, useRef, useEffect } from 'react';
import { Layers, Download, Trash2, Volume2, VolumeX, CheckCircle2, QrCode } from 'lucide-react';
import { ScanResult, BarcodeFormat } from '../../types';
import { ContentParser } from '../../services/parser/contentParser';
import { ScannerEngine } from '../../services/scanner/scannerEngine';
import { ExportService } from '../../services/export/exportService';
import { HistoryRepository } from '../../services/storage/historyRepository';

export const BatchScanner: React.FC = () => {
  const [sessionScans, setSessionScans] = useState<ScanResult[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isScanning, setIsScanning] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastScannedRef = useRef<{ value: string; time: number } | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          scanLoop();
        }
      } catch (err) {
        console.warn('Batch camera failed:', err);
      }
    };

    const scanLoop = async () => {
      if (isScanning && videoRef.current && videoRef.current.readyState >= 2) {
        if ('BarcodeDetector' in window) {
          try {
            const detector = new (window as any).BarcodeDetector({
              formats: ['qr_code', 'ean_13', 'ean_8', 'upc_a', 'code_128', 'code_39']
            });
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0];
              const now = Date.now();

              if (!lastScannedRef.current || lastScannedRef.current.value !== code.rawValue || now - lastScannedRef.current.time > 1500) {
                lastScannedRef.current = { value: code.rawValue, time: now };
                if (soundEnabled) ScannerEngine.playBeep();

                const parsed = ContentParser.parse(code.rawValue, code.format as BarcodeFormat, 'camera');
                await HistoryRepository.saveScan(parsed);
                setSessionScans((prev) => [parsed, ...prev]);
              }
            }
          } catch {}
        }
      }
      animationFrameId = requestAnimationFrame(scanLoop);
    };

    startCamera();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [isScanning, soundEnabled]);

  return (
    <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto'>
      <div className='lg:col-span-5 space-y-4'>
        <div className='relative aspect-square rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl'>
          <video ref={videoRef} playsInline muted className='w-full h-full object-cover' />
          <div className='absolute top-4 left-4 right-4 flex items-center justify-between'>
            <span className='rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-emerald-400 border border-slate-800'>
              Batch Mode Active
            </span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className='rounded-full bg-slate-950/80 p-2 text-slate-200 border border-slate-800 hover:text-emerald-400 transition'
            >
              {soundEnabled ? <Volume2 className='h-4 w-4' /> : <VolumeX className='h-4 w-4' />}
            </button>
          </div>
        </div>

        <div className='flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800'>
          <div>
            <p className='text-xs text-slate-400 uppercase tracking-wider'>Session Total</p>
            <p className='text-2xl font-bold text-white font-mono'>{sessionScans.length}</p>
          </div>
          <button
            onClick={() => setIsScanning(!isScanning)}
            className={isScanning ? "rounded-xl px-4 py-2 text-xs font-semibold transition bg-amber-500/10 text-amber-400 border border-amber-500/20" : "rounded-xl px-4 py-2 text-xs font-semibold transition bg-emerald-500 text-slate-950"}
          >
            {isScanning ? 'Pause Scan' : 'Resume Scan'}
          </button>
        </div>
      </div>

      <div className='lg:col-span-7 flex flex-col h-[520px] rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl'>
        <div className='flex items-center justify-between border-b border-slate-800 pb-4'>
          <div className='flex items-center gap-2'>
            <Layers className='h-5 w-5 text-emerald-400' />
            <h3 className='text-sm font-bold text-white'>Continuous Session Stream</h3>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => ExportService.exportToCSV(sessionScans)}
              disabled={sessionScans.length === 0}
              className='flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50 transition'
            >
              <Download className='h-3.5 w-3.5' /> CSV
            </button>
            <button
              onClick={() => ExportService.exportToJSON(sessionScans)}
              disabled={sessionScans.length === 0}
              className='flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50 transition'
            >
              <Download className='h-3.5 w-3.5' /> JSON
            </button>
            <button
              onClick={() => setSessionScans([])}
              disabled={sessionScans.length === 0}
              className='rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 disabled:opacity-50 transition'
            >
              <Trash2 className='h-4 w-4' />
            </button>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto space-y-2 pr-1'>
          {sessionScans.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full text-center space-y-2 text-slate-500'>
              <QrCode className='h-8 w-8 text-slate-600 stroke-[1.5]' />
              <p className='text-xs'>No items scanned yet in this continuous session.</p>
            </div>
          ) : (
            sessionScans.map((item, idx) => (
              <div key={item.id} className='flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80'>
                <div className='flex items-center gap-3 overflow-hidden'>
                  <span className='text-xs font-mono text-slate-500 w-6'>#{sessionScans.length - idx}</span>
                  <div className='truncate'>
                    <p className='text-xs font-mono text-slate-200 truncate'>{item.rawValue}</p>
                    <span className='text-[10px] text-slate-400 uppercase'>{item.format.replace('_', ' ')} • {item.contentType}</span>
                  </div>
                </div>
                <CheckCircle2 className='h-4 w-4 text-emerald-400 shrink-0' />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
