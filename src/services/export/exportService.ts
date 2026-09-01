import { ScanResult } from "../../types";

export class ExportService {
  static exportToJSON(scans: ScanResult[]): void {
    const blob = new Blob([JSON.stringify(scans, null, 2)], { type: "application/json" });
    this.triggerDownload(blob, `scandesk_export_${Date.now()}.json`);
  }

  static exportToCSV(scans: ScanResult[]): void {
    const headers = ["ID", "Timestamp", "Format", "ContentType", "RawValue", "Notes", "Favorite"];
    const rows = scans.map((s) => [
      `"${s.id}"`,
      `"${new Date(s.timestamp).toISOString()}"`,
      `"${s.format}"`,
      `"${s.contentType}"`,
      `"${s.rawValue.replace(/"/g, '""')}"`,
      `"${(s.notes || "").replace(/"/g, '""')}"`,
      s.isFavorite ? "true" : "false"
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    this.triggerDownload(blob, `scandesk_export_${Date.now()}.csv`);
  }

  static exportToTXT(scans: ScanResult[]): void {
    const textContent = scans
      .map(
        (s, i) =>
          `[#${i + 1}] ${new Date(s.timestamp).toLocaleString()}\nFormat: ${s.format.toUpperCase()}\nType: ${s.contentType.toUpperCase()}\nValue: ${s.rawValue}\n----------------------------------------`
      )
      .join("\n\n");
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8;" });
    this.triggerDownload(blob, `scandesk_export_${Date.now()}.txt`);
  }

  private static triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
