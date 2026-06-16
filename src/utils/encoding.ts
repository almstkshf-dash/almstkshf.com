/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

const WIN1252_TO_BYTE: Record<number, number> = {
  0x20AC: 0x80, // €
  0x201A: 0x82, // ‚
  0x0192: 0x83, // ƒ
  0x201E: 0x84, // „
  0x2026: 0x85, // …
  0x2020: 0x86, // †
  0x2021: 0x87, // ‡
  0x02C6: 0x88, // ˆ
  0x2030: 0x89, // ‰
  0x0160: 0x8A, // Š
  0x2039: 0x8B, // ‹
  0x0152: 0x8C, // Œ
  0x017D: 0x8E, // Ž
  0x2018: 0x91, // ‘
  0x2019: 0x92, // ’
  0x201C: 0x93, // “
  0x201D: 0x94, // ”
  0x2022: 0x95, // •
  0x2013: 0x96, // –
  0x2014: 0x97, // —
  0x02DC: 0x98, // ˜
  0x2122: 0x99, // ™
  0x0161: 0x9A, // š
  0x203A: 0x9B, // ›
  0x0153: 0x9C, // œ
  0x017E: 0x9E, // ž
  0x0178: 0x9F, // Ÿ
};

export function isValidUtf8(bytes: Uint8Array): boolean {
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    decoder.decode(bytes);
    return true;
  } catch {
    return false;
  }
}

export function hasMojibake(text: string): boolean {
  // Matches Ø or Ù followed by a character that maps to a UTF-8 trailing byte (0x80-0xBF)
  // in either Latin1 or Windows-1252.
  const regex = /[\u00D8\u00D9][\u0080-\u00BF\u20AC\u201A\u0192\u201E\u2026\u2020\u2021\u02C6\u2030\u0160\u2039\u0152\u017D\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u02DC\u2122\u0161\u203A\u0153\u017E\u0178]/;
  return regex.test(text);
}

export function tryRecoverMojibake(text: string): string | null {
  try {
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code in WIN1252_TO_BYTE) {
        bytes[i] = WIN1252_TO_BYTE[code];
      } else if (code === 0x20 && i > 0 && bytes[i - 1] === 0xd9) {
        bytes[i] = 0x81; // Map space after 0xd9 to 0x81 (Feh)
      } else if (code <= 255) {
        bytes[i] = code;
      } else {
        return null;
      }
    }
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

export function decodeHtmlBuffer(buffer: ArrayBuffer, contentTypeHeader: string | null): string {
  const bytes = new Uint8Array(buffer);
  
  // 1. Check Content-Type header for charset
  let charset = '';
  if (contentTypeHeader) {
    const match = contentTypeHeader.match(/charset=([\w-]+)/i);
    if (match) {
      charset = match[1].toLowerCase();
    }
  }

  // 2. If no charset in header, look at the first 1024 bytes for XML declaration or meta tags
  if (!charset) {
    const chunk = Array.from(bytes.slice(0, 1024))
      .map(c => String.fromCharCode(c))
      .join('');
    const xmlEncodingMatch = chunk.match(/<\?xml[^>]+encoding=["']([\w-]+)["']/i);
    if (xmlEncodingMatch) {
      charset = xmlEncodingMatch[1].toLowerCase();
    } else {
      const metaCharsetMatch = chunk.match(/<meta[^>]+charset=["']([\w-]+)["']/i) || 
                               chunk.match(/<meta[^>]+http-equiv=["']content-type["'][^>]+content=["'][^"']*charset=([\w-]+)["']/i);
      if (metaCharsetMatch) {
        charset = metaCharsetMatch[1].toLowerCase();
      }
    }
  }

  // Normalize common Arabic charsets
  if (charset === 'windows-1256' || charset === 'cp1256') {
    charset = 'windows-1256';
  } else if (charset === 'iso-8859-6') {
    charset = 'iso-8859-6';
  } else if (charset === 'windows-1252' || charset === 'iso-8859-1' || charset === 'latin1') {
    if (isValidUtf8(bytes)) {
      charset = 'utf-8';
    } else {
      charset = 'windows-1252';
    }
  } else if (!charset) {
    charset = isValidUtf8(bytes) ? 'utf-8' : 'windows-1256';
  }

  try {
    const decoder = new TextDecoder(charset);
    let decodedText = decoder.decode(bytes);

    if (hasMojibake(decodedText)) {
      const recovered = tryRecoverMojibake(decodedText);
      if (recovered) {
        decodedText = recovered;
      }
    }

    return decodedText;
  } catch (err) {
    console.error(`[Encoding] TextDecoder failed for charset ${charset}, falling back to utf-8`, err);
    return new TextDecoder('utf-8').decode(bytes);
  }
}
