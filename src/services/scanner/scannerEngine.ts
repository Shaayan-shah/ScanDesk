import { BarcodeFormat, ScanResult } from "../../types";
import { ContentParser } from "../parser/contentParser";

export class ScannerEngine {
  private static audioCtx: AudioContext | null = null;

  /**
   * Synthesize a clean, subtle audio chime on successful scan (zero external audio files needed).
   */
  static playBeep(): void {
    try {
      const ctx = this.audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
      this.audioCtx = ctx;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08); // Quick upbeat

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio playback failed (user interaction required or not supported)
    }
  }

  /**
   * Decode an image File or Blob (drag-and-drop or screenshot paste).
   */
  static async scanImageFile(file: File | Blob): Promise<ScanResult | null> {
    const bitmap = await createImageBitmap(file);

    // Try native BarcodeDetector
    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      try {
        const detector = new (window as any).BarcodeDetector({
          formats: [
            "qr_code",
            "ean_13",
            "ean_8",
            "upc_a",
            "upc_e",
            "code_128",
            "code_39",
            "code_93",
            "itf",
            "codabar",
            "data_matrix",
            "pdf417",
            "aztec"
          ]
        });

        const barcodes = await detector.detect(bitmap);
        if (barcodes.length > 0) {
          const first = barcodes[0];
          return ContentParser.parse(first.rawValue, first.format as BarcodeFormat, "image_upload");
        }
      } catch (err) {
        console.warn("Native BarcodeDetector image decode failed:", err);
      }
    }

    return null;
  }
}
