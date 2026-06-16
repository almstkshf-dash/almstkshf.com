/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import * as cheerio from 'cheerio';
import { decodeHtmlBuffer } from './encoding';
import { isSafeUrl } from './ssrf';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum bytes read from a remote response to prevent memory exhaustion. */
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024; // 5 MB

/** Maximum number of HTTP 3xx redirect hops before we give up. */
const MAX_REDIRECTS = 5;

/** Maximum meta-refresh recursion depth. */
const MAX_META_REFRESH_DEPTH = 3;

/** Per-request network timeout in milliseconds. */
const FETCH_TIMEOUT_MS = 8_000;

const SHORTENER_DOMAINS = new Set([
  'bit.ly', 'bitly.com', 't.co', 'tinyurl.com', 'rebrand.ly', 'is.gd',
  'buff.ly', 'ow.ly', 'db.tt', 'git.io', 't.me', 'lnkd.in', 'fb.me',
  'amzn.to', 'goo.gl', 'su.pr', 'wp.me', 'short.io', 'rb.gy', 'shorturl.at',
  'tiny.cc', 'qr.ae', 'adf.ly', 'b.link', 'sniply.io', 'clicky.me',
]);

const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'gclsrc', 'dclid', 'yclid', 'msclkid',
  'mc_eid', 'mc_cid', '_hsenc', '_hsmi', 'mkt_tok', 'twclid',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function cleanUrl(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    for (const param of TRACKING_PARAMS) {
      url.searchParams.delete(param);
    }
    if (url.hash && (url.hash.startsWith('#utm_') || url.hash === '#')) {
      url.hash = '';
    }
    return url.toString();
  } catch {
    return urlStr;
  }
}

export function isShortenerUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    let hostname = url.hostname.toLowerCase();
    if (hostname.startsWith('www.')) hostname = hostname.substring(4);
    return SHORTENER_DOMAINS.has(hostname);
  } catch {
    return false;
  }
}

function getScraperUrl(): string {
  const base = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3002';
  return base.endsWith('/scrape') ? base : `${base.replace(/\/+$/, '')}/scrape`;
}

/**
 * Reads up to MAX_RESPONSE_BYTES from a Response body.
 * Prevents memory exhaustion from unexpectedly large responses.
 */
async function readBoundedBuffer(res: Response): Promise<ArrayBuffer | null> {
  const reader = res.body?.getReader();
  if (!reader) return res.arrayBuffer();

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.byteLength;
        if (totalBytes > MAX_RESPONSE_BYTES) {
          console.warn(`[LinkResolver] Response exceeded ${MAX_RESPONSE_BYTES} bytes — truncating.`);
          reader.cancel().catch(() => {});
          // Return what we have so far (cheerio can still parse partial HTML)
          break;
        }
        chunks.push(value);
      }
    }
  } finally {
    reader.releaseLock();
  }

  const combined = new Uint8Array(totalBytes > MAX_RESPONSE_BYTES ? chunks.reduce((a, b) => a + b.byteLength, 0) : totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return combined.buffer;
}

/**
 * Safely extracts and normalises a meta-refresh redirect URL.
 * Returns `null` when the content attribute is absent or malformed.
 */
function parseMetaRefreshUrl(content: string, base: string): string | null {
  // content="5; url=https://example.com" or content="0;URL='https://example.com'"
  const match = content.match(/(?:^|;)\s*url\s*=\s*['"]?([^'">\s]+)['"]?/i);
  if (!match || !match[1]) return null;

  const raw = match[1].trim();
  try {
    // Resolve relative paths against the current page URL
    const resolved = new URL(raw, base).toString();
    // Quick sanity-check: must parse cleanly
    new URL(resolved);
    return resolved;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

interface ResolvedArticle {
  finalUrl: string;
  imageUrl?: string;
  source: string;
}

export async function resolveUrl(
  originalUrl: string,
  country?: string,
  depth = 0
): Promise<ResolvedArticle | null> {
  if (depth > MAX_META_REFRESH_DEPTH) {
    console.warn(`[LinkResolver] Exceeded meta-refresh recursion depth for: ${originalUrl}`);
    return null;
  }

  // --- Initial SSRF guard on the caller-supplied URL ---
  if (!(await isSafeUrl(originalUrl, { allowHttp: true }))) {
    console.warn(`[LinkResolver] Blocked unsafe initial URL: ${originalUrl}`);
    return null;
  }

  try {
    let currentUrl = new URL(originalUrl).toString();
    let redirectCount = 0;
    let response: Response | null = null;
    let standardFetchFailed = false;
    let htmlContent = '';
    let contentTypeHeader = '';

    // -----------------------------------------------------------------------
    // Redirect-following loop (manual, with per-hop SSRF checks)
    // -----------------------------------------------------------------------
    while (redirectCount <= MAX_REDIRECTS) {
      // Re-validate every hop — prevents SSRF via open redirects
      if (!(await isSafeUrl(currentUrl, { allowHttp: true }))) {
        console.warn(`[LinkResolver] Blocked unsafe URL in redirect chain: ${currentUrl}`);
        return null;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      try {
        const res = await fetch(currentUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
          },
          redirect: 'manual',  // We handle redirects manually for per-hop SSRF checks
          signal: controller.signal,
        });
        clearTimeout(timeout);

        // HTTP 3xx redirect
        if (res.status >= 300 && res.status < 400) {
          const location = res.headers.get('location');
          if (!location) {
            response = res;
            break;
          }
          const nextUrl = new URL(location, currentUrl).toString();
          currentUrl = nextUrl;
          redirectCount++;
          continue;
        }

        if (!res.ok) {
          console.warn(`[LinkResolver] Standard fetch returned HTTP ${res.status} for ${currentUrl}`);
          standardFetchFailed = true;
          response = res;
          break;
        }

        response = res;
        contentTypeHeader = res.headers.get('content-type') || '';
        const buffer = await readBoundedBuffer(res);
        if (buffer) {
          htmlContent = decodeHtmlBuffer(buffer, contentTypeHeader);
        }
        break;
      } catch (fetchErr) {
        clearTimeout(timeout);
        console.warn(`[LinkResolver] Standard fetch threw error for ${currentUrl}:`, fetchErr);
        standardFetchFailed = true;
        break;
      }
    }

    if (redirectCount > MAX_REDIRECTS) {
      console.warn(`[LinkResolver] Exceeded maximum redirect limit of ${MAX_REDIRECTS} hops.`);
      standardFetchFailed = true;
    }

    // -----------------------------------------------------------------------
    // Parse HTML — check for meta-refresh, extract OG metadata
    // -----------------------------------------------------------------------
    if (!standardFetchFailed && response && htmlContent) {
      const finalUrl = currentUrl;
      const $ = cheerio.load(htmlContent);

      // --- meta-refresh redirect ---
      const metaRefreshContent = $('meta[http-equiv="refresh"]').attr('content');
      if (metaRefreshContent) {
        const refreshUrl = parseMetaRefreshUrl(metaRefreshContent, finalUrl);
        if (refreshUrl) {
          console.log(`[LinkResolver] Following meta-refresh to: ${refreshUrl}`);
          return resolveUrl(refreshUrl, country, depth + 1);
        }
      }

      // --- Still a shortener? escalate to Playwright ---
      if (isShortenerUrl(finalUrl)) {
        console.warn(`[LinkResolver] Still a shortener after standard fetch: ${finalUrl}. Escalating to Playwright...`);
        standardFetchFailed = true;
      } else {
        // Final SSRF re-check on the resolved URL
        if (!(await isSafeUrl(finalUrl, { allowHttp: true }))) {
          console.warn(`[LinkResolver] Blocked unsafe final URL: ${finalUrl}`);
          return null;
        }

        const imageUrl =
          $('meta[property="og:image"]').attr('content') ||
          $('meta[name="twitter:image"]').attr('content');
        const siteName =
          $('meta[property="og:site_name"]').attr('content') ||
          new URL(finalUrl).hostname;

        return { finalUrl: cleanUrl(finalUrl), imageUrl, source: siteName };
      }
    }

    // -----------------------------------------------------------------------
    // Fallback: Premium Playwright Scraper Service
    // -----------------------------------------------------------------------
    try {
      // Re-validate original URL before handing it to the scraper
      if (!(await isSafeUrl(originalUrl, { allowHttp: true }))) {
        console.warn(`[LinkResolver] Blocked unsafe URL before scraper invocation: ${originalUrl}`);
        return null;
      }

      console.log(`[LinkResolver] Invoking Playwright Scraper Service for: ${originalUrl}`);
      const scraperResponse = await fetch(getScraperUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: originalUrl, country }),
      });

      if (scraperResponse.ok) {
        const scraperData = await scraperResponse.json();
        if (scraperData.success) {
          const resolvedUrl = scraperData.url || originalUrl;

          // Validate the URL the scraper claims to have resolved
          if (!(await isSafeUrl(resolvedUrl, { allowHttp: true }))) {
            console.warn(`[LinkResolver] Scraper resolved to unsafe URL: ${resolvedUrl}`);
            return null;
          }

          console.log(`[LinkResolver] Playwright Scraper resolved: ${originalUrl} → ${resolvedUrl}`);
          return {
            finalUrl: cleanUrl(resolvedUrl),
            imageUrl: scraperData.imageUrl,
            source: scraperData.sourceName || new URL(resolvedUrl).hostname,
          };
        }
      } else {
        console.error(`[LinkResolver] Playwright Scraper returned HTTP ${scraperResponse.status}`);
      }
    } catch (scraperErr: unknown) {
      const msg = scraperErr instanceof Error ? scraperErr.message : String(scraperErr);
      console.error(`[LinkResolver] Playwright Scraper call failed:`, msg);
    }

    return null;
  } catch (error) {
    console.warn(`[LinkResolver] Failed to resolve: ${originalUrl}`, error);
    return null;
  }
}
