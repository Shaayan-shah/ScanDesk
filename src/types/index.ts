export type BarcodeFormat =
  | 'qr_code'
  | 'ean_13'
  | 'ean_8'
  | 'upc_a'
  | 'code_128'
  | 'code_39'
  | 'data_matrix';

export type ContentType =
  | 'url'
  | 'wifi'
  | 'vcard'
  | 'whatsapp'
  | 'email'
  | 'phone'
  | 'sms'
  | 'geo'
  | 'product_code'
  | 'plain';

export interface SecurityAnalysis {
  isSecureProtocol: boolean;
  hasTrackingParams: boolean;
  cleanUrl?: string;
  domain?: string;
  riskScore: 'low' | 'medium' | 'high';
  threatDescription?: string;
}

export interface ParsedWifi {
  ssid: string;
  password?: string;
  authType: 'WPA' | 'WEP' | 'nopass' | 'WPA2' | 'WPA3';
  isHidden: boolean;
}

export interface ParsedVCard {
  fullName: string;
  phone?: string;
  email?: string;
  organization?: string;
  title?: string;
  url?: string;
  address?: string;
}

export interface ScanResult {
  id: string;
  rawValue: string;
  format: BarcodeFormat;
  contentType: ContentType;
  timestamp: number;
  isFavorite?: boolean;
  notes?: string;
  categoryTitle?: string;
  security?: SecurityAnalysis;
  parsedWifi?: ParsedWifi;
  parsedVCard?: ParsedVCard;
  isBatchItem?: boolean;
}

