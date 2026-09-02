const BLOCKED_SCHEMES = ['javascript:', 'data:', 'file:', 'vbscript:'];

export class SecurityService {
  static isSafeUrl(rawUrl: string): { isSafe: boolean; sanitizedUrl?: string } {
    if (!rawUrl) return { isSafe: false };
    const lower = rawUrl.trim().toLowerCase();
    for (const b of BLOCKED_SCHEMES) {
      if (lower.startsWith(b)) return { isSafe: false };
    }
    if (lower.startsWith('http://') || lower.startsWith('https://')) {
      return { isSafe: true, sanitizedUrl: rawUrl.trim() };
    }
    if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(rawUrl.trim())) {
      return { isSafe: true, sanitizedUrl: `https://${rawUrl.trim()}` };
    }
    return { isSafe: false };
  }
}
