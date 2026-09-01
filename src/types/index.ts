export type BarcodeFormat =
  | "qr_code"
  | "ean_13"
  | "ean_8"
  | "upc_a"
  | "upc_e"
  | "code_128"
  | "code_39"
  | "code_93"
  | "itf"
  | "codabar"
  | "data_matrix"
  | "pdf417"
  | "aztec";

export type ContentType =
  | "url"
  | "wifi"
  | "vcard"
  | "email"
  | "phone"
  | "sms"
  | "geo"
  | "isbn"
  | "product_code"
  | "plain";

export interface WiFiData {
  ssid: string;
  password?: string;
  authType: "WPA" | "WEP" | "nopass" | string;
  hidden?: boolean;
}

export interface VCardData {
  fullName: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  url?: string;
  address?: string;
  note?: string;
}

export interface EmailData {
  to: string;
  subject?: string;
  body?: string;
}

export interface SMSData {
  phoneNumber: string;
  message?: string;
}

export interface GeoData {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface ProductData {
  code: string;
  format: string;
}

export type ParsedResultData =
  | { type: "url"; url: string; domain: string; isSecure: boolean }
  | { type: "wifi"; wifi: WiFiData }
  | { type: "vcard"; contact: VCardData }
  | { type: "email"; email: EmailData }
  | { type: "phone"; phoneNumber: string }
  | { type: "sms"; sms: SMSData }
  | { type: "geo"; geo: GeoData }
  | { type: "isbn"; isbn: string }
  | { type: "product_code"; product: ProductData }
  | { type: "plain"; text: string };

export interface ScanResult {
  id: string;
  rawValue: string;
  format: BarcodeFormat;
  contentType: ContentType;
  parsedData: ParsedResultData;
  timestamp: number;
  source: "camera" | "image_upload" | "clipboard" | "generated_self_test";
  isFavorite?: boolean;
  notes?: string;
  tags?: string[];
}

export interface PlatformCapability {
  platform: "web" | "desktop" | "android" | "ios";
  engine: string;
  isNativeSupported: boolean;
  supportedFormats: BarcodeFormat[];
  supportsCamera: boolean;
  supportsTorch: boolean;
}

export interface AppSettings {
  duplicateCooldownMs: number;
  soundFeedback: boolean;
  vibrateFeedback: boolean;
  autoOpenSafeUrls: boolean;
  theme: "dark" | "light" | "system";
  defaultCameraFacing: "environment" | "user";
}
