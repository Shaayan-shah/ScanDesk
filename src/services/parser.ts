import { BarcodeFormat, ScanResult } from '../types';

export class ContentParser {
  static parse(rawValue: string, format: BarcodeFormat = 'qr_code'): ScanResult {
    const trimmed = rawValue.trim();
    const id = 'scan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const timestamp = Date.now();

    if (trimmed.toUpperCase().startsWith('WIFI:')) {
      return { id, rawValue, format, contentType: 'wifi', timestamp, categoryTitle: 'Wi-Fi Network' };
    }
    if (trimmed.toUpperCase().includes('BEGIN:VCARD')) {
      return { id, rawValue, format, contentType: 'vcard', timestamp, categoryTitle: 'Contact Card (vCard)' };
    }
    if (trimmed.toLowerCase().startsWith('tel:')) {
      return { id, rawValue, format, contentType: 'phone', timestamp, categoryTitle: 'Phone Number' };
    }
    if (trimmed.toLowerCase().startsWith('mailto:')) {
      return { id, rawValue, format, contentType: 'email', timestamp, categoryTitle: 'Email Address' };
    }
    if (trimmed.toLowerCase().startsWith('smsto:') || trimmed.toLowerCase().startsWith('sms:')) {
      return { id, rawValue, format, contentType: 'sms', timestamp, categoryTitle: 'SMS Message' };
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
      return { id, rawValue, format, contentType: 'url', timestamp, categoryTitle: 'Web URL' };
    }
    if (['ean_13', 'ean_8', 'upc_a', 'upc_e'].includes(format)) {
      return { id, rawValue, format, contentType: 'product_code', timestamp, categoryTitle: 'Product Barcode' };
    }

    return { id, rawValue, format, contentType: 'plain', timestamp, categoryTitle: 'Text Message' };
  }
}
