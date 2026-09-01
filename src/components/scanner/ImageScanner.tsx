import React, { useState } from "react";
import { UploadCloud, Image as ImageIcon, Clipboard, FileCheck, AlertCircle } from "lucide-react";
import { ScanResult } from "../../types";
import { ScannerEngine } from "../../services/scanner/scannerEngine";
import { HistoryRepository } from "../../services/storage/historyRepository";

interface ImageScannerProps {
  onScanResult: (result: ScanResult) => void;
}

export const ImageScanner: React.FC<ImageScannerProps> = ({ onScanResult }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setErrorMsg(null);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const result = await ScannerEngine.scanImageFile(file);
      if (result) {
        await HistoryRepository.saveScan(result);
        onScanResult(result);
      } else {
        setErrorMsg("No clear QR or Barcode detected in this image. Ensure high contrast and good resolution.");
      }
    } catch (err) {
      setErrorMsg("Failed to decode image file.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            processFile(new File([blob], "clipboard_image.png", { type }));
            return;
          }
        }
      }
      setErrorMsg("No image data found on clipboard. Press Ctrl+V with an image copied.");
    } catch {
      setErrorMsg("Clipboard permission required or unsupported.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center p-10 rounded-3xl border-2 border-dashed transition-all ${
          isDragging
            ? "border-emerald-400 bg-emerald-500/10 scale-[1.01]"
            : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
        }`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
          <UploadCloud className="h-7 w-7" />
        </div>

        <h3 className="text-base font-semibold text-white mb-1">Drag & Drop Image or Screenshot</h3>
        <p className="text-xs text-slate-400 mb-6 text-center max-w-sm">
          Supports PNG, JPG, WEBP, and screenshot crops with instant offline decoding.
        </p>

        <label className="cursor-pointer rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition shadow-md">
          Browse File
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
          />
        </label>
      </div>

      {/* Clipboard Action */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <Clipboard className="h-5 w-5 text-slate-400" />
          <div>
            <p className="text-xs font-semibold text-white">Paste from Clipboard</p>
            <p className="text-[11px] text-slate-400">Press Ctrl+V anywhere or click button</p>
          </div>
        </div>
        <button
          onClick={handlePaste}
          className="rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
        >
          Paste Image
        </button>
      </div>

      {/* Error Card */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
