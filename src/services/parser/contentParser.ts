import { BarcodeFormat, ContentType, ParsedResultData, ScanResult } from "../../types";
import { SecurityService } from "../security/securityService";

export class ContentParser {
  static parse(rawValue: string, format: BarcodeFormat, source: ScanResult["source"] = "camera"): ScanResult {
    const trimmed = rawValue.trim();
    const id = "scan_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    const timestamp = Date.now();

    // 1. Wi-Fi: WIFI:T:WPA;S:MySSID;P:MyPassword;;
    if (trimmed.toUpperCase().startsWith("WIFI:")) {
      const wifi = ContentParser.parseWiFi(trimmed);
      return {
        id,
        rawValue,
        format,
        contentType: "wifi",
        parsedData: { type: "wifi", wifi },
        timestamp,
        source
      };
    }

    // 2. vCard: BEGIN:VCARD ... END:VCARD
    if (trimmed.toUpperCase().includes("BEGIN:VCARD")) {
      const contact = ContentParser.parseVCard(trimmed);
      return {
        id,
        rawValue,
        format,
        contentType: "vcard",
        parsedData: { type: "vcard", contact },
        timestamp,
        source
      };
    }

    // 3. Email: mailto: or MATMSG:
    if (trimmed.toLowerCase().startsWith("mailto:") || trimmed.toUpperCase().startsWith("MATMSG:")) {
      const email = ContentParser.parseEmail(trimmed);
      return {
        id,
        rawValue,
        format,
        contentType: "email",
        parsedData: { type: "email", email },
        timestamp,
        source
      };
    }

    // 4. Phone: tel:
    if (trimmed.toLowerCase().startsWith("tel:")) {
      const phoneNumber = trimmed.substring(4).trim();
      return {
        id,
        rawValue,
        format,
        contentType: "phone",
        parsedData: { type: "phone", phoneNumber },
        timestamp,
        source
      };
    }

    // 5. SMS: SMSTO: or sms:
    if (trimmed.toUpperCase().startsWith("SMSTO:") || trimmed.toLowerCase().startsWith("sms:")) {
      const sms = ContentParser.parseSMS(trimmed);
      return {
        id,
        rawValue,
        format,
        contentType: "sms",
        parsedData: { type: "sms", sms },
        timestamp,
        source
      };
    }

    // 6. Geo: geo:37.7749,-122.4194
    if (trimmed.toLowerCase().startsWith("geo:")) {
      const geo = ContentParser.parseGeo(trimmed);
      if (geo) {
        return {
          id,
          rawValue,
          format,
          contentType: "geo",
          parsedData: { type: "geo", geo },
          timestamp,
          source
        };
      }
    }

    // 7. URL
    const urlCheck = SecurityService.isSafeUrl(trimmed);
    if (urlCheck.isSafe && urlCheck.sanitizedUrl) {
      try {
        const u = new URL(urlCheck.sanitizedUrl);
        return {
          id,
          rawValue,
          format,
          contentType: "url",
          parsedData: {
            type: "url",
            url: urlCheck.sanitizedUrl,
            domain: u.hostname,
            isSecure: u.protocol === "https:"
          },
          timestamp,
          source
        };
      } catch {
        // Fallthrough to plain
      }
    }

    // 8. 1D Product Barcodes: EAN-13, EAN-8, UPC-A, UPC-E
    if (["ean_13", "ean_8", "upc_a", "upc_e"].includes(format)) {
      return {
        id,
        rawValue,
        format,
        contentType: "product_code",
        parsedData: {
          type: "product_code",
          product: { code: rawValue, format: format.toUpperCase().replace("_", "-") }
        },
        timestamp,
        source
      };
    }

    // 9. Plain Text
    return {
      id,
      rawValue,
      format,
      contentType: "plain",
      parsedData: { type: "plain", text: rawValue },
      timestamp,
      source
    };
  }

  private static parseWiFi(raw: string) {
    const ssidMatch = raw.match(/S:([^;]+)/i);
    const passMatch = raw.match(/P:([^;]+)/i);
    const typeMatch = raw.match(/T:([^;]+)/i);
    const hiddenMatch = raw.match(/H:([^;]+)/i);

    return {
      ssid: ssidMatch ? ssidMatch[1] : "Unknown SSID",
      password: passMatch ? passMatch[1] : undefined,
      authType: typeMatch ? typeMatch[1] : "WPA",
      hidden: hiddenMatch ? hiddenMatch[1].toLowerCase() === "true" : false
    };
  }

  private static parseVCard(raw: string) {
    const lines = raw.split(/\r\n|\r|\n/);
    let fullName = "";
    let org = "";
    let title = "";
    let phone = "";
    let email = "";
    let url = "";
    let note = "";

    for (const line of lines) {
      if (line.startsWith("FN:")) fullName = line.substring(3).trim();
      else if (line.startsWith("ORG:")) org = line.substring(4).trim();
      else if (line.startsWith("TITLE:")) title = line.substring(6).trim();
      else if (line.startsWith("TEL") && line.includes(":")) phone = line.split(":")[1].trim();
      else if (line.startsWith("EMAIL") && line.includes(":")) email = line.split(":")[1].trim();
      else if (line.startsWith("URL") && line.includes(":")) url = line.split(":")[1].trim();
      else if (line.startsWith("NOTE:")) note = line.substring(5).trim();
    }

    return {
      fullName: fullName || "Unnamed Contact",
      organization: org || undefined,
      title: title || undefined,
      phone: phone || undefined,
      email: email || undefined,
      url: url || undefined,
      note: note || undefined
    };
  }

  private static parseEmail(raw: string) {
    if (raw.toLowerCase().startsWith("mailto:")) {
      const url = new URL(raw);
      return {
        to: url.pathname,
        subject: url.searchParams.get("subject") || undefined,
        body: url.searchParams.get("body") || undefined
      };
    }
    // MATMSG:TO:user@example.com;SUB:Subject;BODY:Hello;;
    const toMatch = raw.match(/TO:([^;]+)/i);
    const subMatch = raw.match(/SUB:([^;]+)/i);
    const bodyMatch = raw.match(/BODY:([^;]+)/i);
    return {
      to: toMatch ? toMatch[1] : "",
      subject: subMatch ? subMatch[1] : undefined,
      body: bodyMatch ? bodyMatch[1] : undefined
    };
  }

  private static parseSMS(raw: string) {
    // SMSTO:+123456789:Hello or sms:+123456789?body=Hello
    if (raw.toUpperCase().startsWith("SMSTO:")) {
      const parts = raw.substring(6).split(":");
      return {
        phoneNumber: parts[0] || "",
        message: parts.slice(1).join(":") || undefined
      };
    }
    const clean = raw.replace(/^sms:/i, "");
    const parts = clean.split("?");
    const phone = parts[0] || "";
    let msg: string | undefined = undefined;
    if (parts[1]) {
      const params = new URLSearchParams(parts[1]);
      msg = params.get("body") || undefined;
    }
    return { phoneNumber: phone, message: msg };
  }

  private static parseGeo(raw: string) {
    // geo:37.7749,-122.4194,100
    const coords = raw.substring(4).split(";")[0].split(",");
    if (coords.length >= 2) {
      const lat = parseFloat(coords[0]);
      const lon = parseFloat(coords[1]);
      const alt = coords[2] ? parseFloat(coords[2]) : undefined;
      if (!isNaN(lat) && !isNaN(lon)) {
        return { latitude: lat, longitude: lon, altitude: alt };
      }
    }
    return undefined;
  }
}
