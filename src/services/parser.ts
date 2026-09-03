import { BarcodeFormat, ContentType, ParsedVCard, ParsedWifi, ScanResult, SecurityAnalysis } from '../types';

export class ContentParser {
  static parse(rawValue: string, format: BarcodeFormat = 'qr_code', isBatchItem = false): ScanResult {
    const trimmed = rawValue.trim();
    const id = 'scan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const timestamp = Date.now();

    // 1. Wi-Fi Detection & Parsing
    if (trimmed.toUpperCase().startsWith('WIFI:')) {
      const parsedWifi = this.parseWifi(trimmed);
      return {
        id,
        rawValue,
        format,
        contentType: 'wifi',
        timestamp,
        categoryTitle: 'Wi-Fi Network',
        parsedWifi,
        isBatchItem,
      };
    }

    // 2. vCard 3.0 / MeCard Detection & Parsing
    if (trimmed.toUpperCase().includes('BEGIN:VCARD') || trimmed.toUpperCase().startsWith('MECARD:')) {
      const parsedVCard = this.parseVCard(trimmed);
      return {
        id,
        rawValue,
        format,
        contentType: 'vcard',
        timestamp,
        categoryTitle: 'Digital Contact (vCard)',
        parsedVCard,
        isBatchItem,
      };
    }

    // 3. WhatsApp Direct Chat
    if (trimmed.includes('wa.me/') || trimmed.startsWith('whatsapp://') || trimmed.includes('api.whatsapp.com/send')) {
      return {
        id,
        rawValue,
        format,
        contentType: 'whatsapp',
        timestamp,
        categoryTitle: 'WhatsApp Chat',
        isBatchItem,
      };
    }

    // 4. Phone Dial
    if (trimmed.toLowerCase().startsWith('tel:')) {
      return {
        id,
        rawValue,
        format,
        contentType: 'phone',
        timestamp,
        categoryTitle: 'Phone Number',
        isBatchItem,
      };
    }

    // 5. Email Mailto
    if (trimmed.toLowerCase().startsWith('mailto:')) {
      return {
        id,
        rawValue,
        format,
        contentType: 'email',
        timestamp,
        categoryTitle: 'Email Address',
        isBatchItem,
      };
    }

    // 6. SMS Message
    if (trimmed.toLowerCase().startsWith('smsto:') || trimmed.toLowerCase().startsWith('sms:')) {
      return {
        id,
        rawValue,
        format,
        contentType: 'sms',
        timestamp,
        categoryTitle: 'SMS Message',
        isBatchItem,
      };
    }

    // 7. Web URL with Security & Tracking Analysis
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
      const urlToTest = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      const security = this.analyzeUrlSecurity(urlToTest);
      return {
        id,
        rawValue,
        format,
        contentType: 'url',
        timestamp,
        categoryTitle: 'Web Link',
        security,
        isBatchItem,
      };
    }

    // 8. Retail Barcode Format
    if (['ean_13', 'ean_8', 'upc_a', 'code_128', 'code_39'].includes(format)) {
      return {
        id,
        rawValue,
        format,
        contentType: 'product_code',
        timestamp,
        categoryTitle: 'Product Barcode',
        isBatchItem,
      };
    }

    // 9. Default Plain Text
    return {
      id,
      rawValue,
      format,
      contentType: 'plain',
      timestamp,
      categoryTitle: 'Text Payload',
      isBatchItem,
    };
  }

  private static parseWifi(raw: string): ParsedWifi {
    let ssid = 'Unknown Network';
    let password = '';
    let authType: 'WPA' | 'WEP' | 'nopass' | 'WPA2' | 'WPA3' = 'WPA';
    let isHidden = false;

    // Pattern: WIFI:S:MySSID;T:WPA;P:MyPassword;H:true;;
    const ssidMatch = raw.match(/S:([^;]+)/i);
    const passMatch = raw.match(/P:([^;]+)/i);
    const typeMatch = raw.match(/T:([^;]+)/i);
    const hiddenMatch = raw.match(/H:([^;]+)/i);

    if (ssidMatch) ssid = ssidMatch[1];
    if (passMatch) password = passMatch[1];
    if (typeMatch) {
      const t = typeMatch[1].toUpperCase();
      if (t === 'WEP') authType = 'WEP';
      else if (t === 'NOPASS') authType = 'nopass';
      else if (t === 'WPA3') authType = 'WPA3';
      else authType = 'WPA2';
    }
    if (hiddenMatch && hiddenMatch[1].toLowerCase() === 'true') isHidden = true;

    return { ssid, password, authType, isHidden };
  }

  private static parseVCard(raw: string): ParsedVCard {
    let fullName = 'Contact';
    let phone: string | undefined;
    let email: string | undefined;
    let organization: string | undefined;
    let title: string | undefined;
    let url: string | undefined;
    let address: string | undefined;

    const lines = raw.split(/\r\n|\r|\n/);
    for (const line of lines) {
      if (line.startsWith('FN:')) fullName = line.substring(3).trim();
      else if (line.startsWith('TEL:') || line.startsWith('TEL;')) phone = line.substring(line.indexOf(':') + 1).trim();
      else if (line.startsWith('EMAIL:') || line.startsWith('EMAIL;')) email = line.substring(line.indexOf(':') + 1).trim();
      else if (line.startsWith('ORG:')) organization = line.substring(4).trim();
      else if (line.startsWith('TITLE:')) title = line.substring(6).trim();
      else if (line.startsWith('URL:')) url = line.substring(4).trim();
      else if (line.startsWith('ADR:')) address = line.substring(4).replace(/;/g, ' ').trim();
    }

    return { fullName, phone, email, organization, title, url, address };
  }

  private static analyzeUrlSecurity(urlStr: string): SecurityAnalysis {
    let domain = '';
    let isSecureProtocol = urlStr.startsWith('https://');
    let hasTrackingParams = false;
    let cleanUrl = urlStr;
    let riskScore: 'low' | 'medium' | 'high' = 'low';
    let threatDescription = 'Verified standard web link with SSL.';

    try {
      const parsed = new URL(urlStr);
      domain = parsed.hostname;

      // Trackers check (utm_source, utm_medium, fbclid, gclid, etc.)
      const trackingKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref', 'source'];
      const currentParams = Array.from(parsed.searchParams.keys());
      hasTrackingParams = currentParams.some((k) => trackingKeys.includes(k.toLowerCase()));

      if (hasTrackingParams) {
        const cleanParams = new URLSearchParams(parsed.search);
        trackingKeys.forEach((k) => cleanParams.delete(k));
        parsed.search = cleanParams.toString();
        cleanUrl = parsed.toString();
      }

      // Risk analysis
      if (!isSecureProtocol) {
        riskScore = 'medium';
        threatDescription = 'Insecure HTTP protocol. Data transmitted is not encrypted.';
      }

      // Check if domain is a raw IP address
      if (/^(\d{1,3}\.){3}\d{1,3}$/.test(domain)) {
        riskScore = 'high';
        threatDescription = 'Direct IP address URL detected. Often associated with unverified hosts.';
      }
    } catch {
      domain = urlStr;
    }

    return {
      isSecureProtocol,
      hasTrackingParams,
      cleanUrl,
      domain,
      riskScore,
      threatDescription,
    };
  }
}

