# 🔍 ScanDesk Pro — Private Offline QR & Barcode Suite

A high-performance, private, offline-first QR and barcode scanning & generation platform with modern dimensional UI. Designed for zero-latency camera scanning, drag-and-drop image decoding, batch processing, and cryptographic local history storage.

---

## 🌟 Key Features

- **Live Camera Scanner**: High-speed real-time decoding with animated crosshair laser alignment, front/back camera toggle, and torch/flashlight support.
- **Smart Content Parsers**:
  - 🌐 **Web URLs**: Security domain verification & malicious scheme blocker (`javascript:`, `file:`, `data:` blocked).
  - 📶 **Wi-Fi Networks**: Instant parse of network SSID, encryption type (`WPA`/`WEP`), and password.
  - 👤 **vCard Contacts**: Name, phone, email, organization, and address cards.
  - 🏷️ **1D Retail Barcodes**: EAN-13, EAN-8, UPC-A, UPC-E, Code-128, Code-39.
- **Drag & Drop / Clipboard Scanner**: Instant decode of image screenshots and clipboard paste (`Ctrl+V`).
- **QR Studio with Automated Loopback Verification**: Real-time generation of URLs, Wi-Fi, Contacts, and Text with **mandatory automated decode validation** (Generate ➔ Decode ➔ Verify 100%) before PNG download.
- **Continuous Batch Scanning**: High-throughput session scanner with duplicate suppression timer, live audit counter, and 1-click CSV/JSON export.
- **Encrypted Local History**: Private IndexedDB storage with tags, notes, search filter, and data wipe controls.
- **100% Zero Telemetry**: Works fully offline with zero internet tracking.

---

## 🚀 Quick Start (Zero Dependencies)

### 1. Windows 1-Click
Double-click `start.bat` to launch the application.

### 2. Manual Run
```bash
# Install dependencies
npm install

# Start local server
npm run dev

# Build production bundle
npm run build
```

---

## 📜 License
MIT License • Engineered by [Shayan Shah](https://github.com/Shaayan-shah)
