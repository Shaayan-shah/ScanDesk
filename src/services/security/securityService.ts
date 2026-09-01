/**
 * Security Service for Untrusted Barcode/QR Input
 * Implements strict scheme allowlisting, sanitization, and URL validation.
 */

const ALLOWED_SCHEMES = new Set(["https:", "http:", "mailto:", "tel:", "sms:", "geo:"]);
const BLOCKED_SCHEMES = new Set(["javascript:", "data:", "file:", "vbscript:", "blob:"]);

export class SecurityService {
  /**
   * Validates if a URL is safe to open in a browser or native intent.
   */
  static isSafeUrl(rawUrl: string): { isSafe: boolean; reason?: string; sanitizedUrl?: string } {
    if (!rawUrl || typeof rawUrl !== "string") {
      return { isSafe: false, reason: "Empty or invalid input" };
    }

    const trimmed = rawUrl.trim();

    // Check for explicit blocked schemes
    const lower = trimmed.toLowerCase();
    for (const blocked of BLOCKED_SCHEMES) {
      if (lower.startsWith(blocked)) {
        return { isSafe: false, reason: `Blocked hazardous URI scheme: ${blocked}` };
      }
    }

    try {
      const parsed = new URL(trimmed);
      if (!ALLOWED_SCHEMES.has(parsed.protocol)) {
        return { isSafe: false, reason: `Unsupported protocol: ${parsed.protocol}` };
      }
      return { isSafe: true, sanitizedUrl: parsed.href };
    } catch {
      // If it doesn't parse as a full URL with scheme, treat as plain text unless it's a domain
      if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
        return { isSafe: true, sanitizedUrl: `https://${trimmed}` };
      }
      return { isSafe: false, reason: "Not a valid RFC URL" };
    }
  }

  /**
   * Escape HTML entities to prevent XSS injection in raw payload rendering.
   */
  static escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
