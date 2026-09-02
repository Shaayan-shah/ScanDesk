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
  | 'email'
  | 'phone'
  | 'sms'
  | 'geo'
  | 'product_code'
  | 'plain';

export interface ScanResult {
  id: string;
  rawValue: string;
  format: BarcodeFormat;
  contentType: ContentType;
  timestamp: number;
  isFavorite?: boolean;
  notes?: string;
  categoryTitle?: string;
}
