/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import Parser from 'rss-parser';
import { FeedItem } from '@/types/rss';
import { decodeHtmlBuffer, hasMojibake, tryRecoverMojibake } from '@/utils/encoding';
import { isSafeUrl } from '@/utils/ssrf';

/**
 * Spoofed browser User-Agent string.
 * Many Arabic news servers (Al-Arabiya, Sky News Arabia, etc.) reject requests
 * from non-browser User-Agents with 403 Forbidden or silently drop the connection.
 * Using a real Chrome UA prevents being flagged as a bot scraper.
 */
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * Timeout in milliseconds for each remote feed fetch.
 * Prevents a slow/unresponsive server from stalling the API route handler.
 */
const FETCH_TIMEOUT_MS = 10_000;

/**
 * Standard RSS Parser instance.
 * Configured with customFields so we capture media, full content, and encoded HTML.
 * Typed as `any` because rss-parser's generics don't expose all custom fields.
 */
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['description', 'description'],
      ['content:encoded', 'contentEncoded'],
      ['content:encoded', 'content'],
    ],
  },
  // Disable the built-in fetch so we can use our own (with UA header + timeout)
  requestOptions: {
    // rss-parser passes these to Node's http.request â€” but we bypass parseURL entirely
    // rss-parser passes these to Node's http.request — but we bypass parseURL entirely
    rejectUnauthorized: false,
  },
});

/**
 * Extracts a representative image URL from various RSS fields.
 */
function extractImage(item: any): string | undefined {
  // 1. Check media:content (from rss-parser custom fields)
  if (item.media && item.media.$ && item.media.$.url) {
    return coerceToString(item.media.$.url);
  }
  
  // 2. Check enclosures
  if (item.enclosure && item.enclosure.url) {
    return coerceToString(item.enclosure.url);
  }
  
  // 3. Extract from description or content (HTML)
  const combined = coerceToString(item.contentEncoded) + coerceToString(item.description) + coerceToString(item.content);
  const imgMatch = combined.match(/<img[^>]+src="([^">]+)"/i);
  if (imgMatch && imgMatch[1]) {
    // Some feeds use relative URLs which won't work
    if (imgMatch[1].startsWith('http')) return imgMatch[1];
  }
  
  return undefined;
}

/**
 * Heuristic to detect if text is primarily Arabic.
 */
function isArabic(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
  return arabicPattern.test(text);
}

/**
 * Resolves the Playwright Scraper microservice endpoint.
 */
function getScraperUrl(): string {
  const base = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3002';
  return base.endsWith('/scrape') ? base : `${base.replace(/\/+$/, '')}/scrape`;
}

/**
 * Attempts to fetch a URL using the Playwright Scraper microservice.
 */
async function tryScraper(url: string, country?: string): Promise<string | null> {
  try {
    const scraperRes = await fetch(getScraperUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, country: country || 'AE', timeout: 8000, waitAfterLoad: 0 })
    });
    if (scraperRes.ok) {
      const scraperData = await scraperRes.json();
      if (scraperData.success && (scraperData.rawContent || scraperData.rawContentBase64)) {
        console.log(`[RSS Engine] Playwright Scraper fetched RSS XML successfully: ${url}`);
        if (scraperData.rawContentBase64) {
          const buffer = Buffer.from(scraperData.rawContentBase64, 'base64');
          return decodeHtmlBuffer(buffer, scraperData.contentType || scraperData.headers?.['content-type']);
        } else {
          return scraperData.rawContent;
        }
      }
    }
  } catch (err: any) {
    console.error(`[RSS Engine] Playwright Scraper service call failed:`, err.message);
  }
  return null;
}

/**
 * Coerces a parsed XML field into a clean string to prevent type errors.
 */
function coerceToString(value: any): string {
  try {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return '';
      return coerceToString(value[0]);
    }
    if (typeof value === 'object') {
      if ('_' in value) {
        return coerceToString(value._);
      }
      if ('text' in value) {
        return coerceToString(value.text);
      }
      if ('#text' in value) {
        return coerceToString(value['#text']);
      }
      if (typeof value.toString === 'function' && value.toString !== Object.prototype.toString) {
        return value.toString();
      }
    }
    return String(value);
  } catch (err) {
    console.error('[RSS Engine] Error coercing value to string:', err);
    return '';
  }
}

/**
 * Fetches a remote RSS/Atom feed as raw XML using a spoofed browser User-Agent,
 * then parses it server-side into a standardised FeedItem array.
 */
export async function parseFeed(
  url: string,
  sourceName: string = 'RSS Feed',
  country?: string
): Promise<FeedItem[]> {
  if (!(await isSafeUrl(url, { allowHttp: true }))) {
    throw new Error(`Blocked unsafe URL: ${url}`);
  }

  const premiumDomains = [
    'gulfnews.com', 'khaleejtimes.com', 'thenationalnews.com', 'gulftoday.ae', 
    'skynewsarabia.com', 'emirates247.com', 'middleeasteye.net', 'prnewswire.com', 
    'aetoswire.com', 'zawya.com', 'mydubainews.com', 'dubaichronicle.com', 
    'thearabianpost.com', 'saudigazette.com.sa', 'arabnews.com', 'aljazeera.com', 
    'albiladpress.com', 'twentyfoursevennews.com', 'thepeninsulaqatar.com', 
    'al-sharq.com', 'aljarida.com', 'kuna.net.kw', 'dohanews.co', 'alwahdanews.ae', 
    'dawn.com', 'pakistantoday.com.pk', 'telegraph.co.uk', 'bizbahrain.com', 
    'bahrainthisweek.com', 'newvoragroup.com', 'wordpress.com'
  ];

  const parsedUrl = new URL(url);
  const isPremiumDomain = premiumDomains.some(domain => parsedUrl.hostname.toLowerCase().includes(domain));
  let useScraperFallback = isPremiumDomain;
  let rawXml: string = '';

  if (useScraperFallback) {
    console.log(`[RSS Engine] Premium/protected domain detected: ${parsedUrl.hostname}. Bypassing direct fetch and routing via Playwright Scraper Service...`);
    const scraped = await tryScraper(url, country);
    if (scraped) {
      rawXml = scraped;
      useScraperFallback = false;
    } else {
      console.log(`[RSS Engine] Premium scraper failed. Falling back to direct fetch for: ${url}`);
    }
  }

  if (!rawXml) {
    // ── 1. FETCH raw XML with spoofed headers + timeout ──────────────────────
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response | null = null;
    try {
      let currentUrl = url;
      let redirectCount = 0;
      const maxRedirects = 5;

      while (redirectCount <= maxRedirects) {
        if (!(await isSafeUrl(currentUrl, { allowHttp: true }))) {
          throw new Error(`Blocked unsafe URL in feed redirect chain: ${currentUrl}`);
        }

        const fetchOptions: RequestInit = {
          signal: controller.signal,
          redirect: 'manual',
          headers: {
            'User-Agent': BROWSER_UA,
            Accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7',
            'Accept-Language': 'ar,en;q=0.9',
            Referer: new URL(currentUrl).origin + '/',
          },
          cache: 'no-store',
        };

        const res = await fetch(currentUrl, fetchOptions);

        if (res.status >= 300 && res.status < 400) {
          const location = res.headers.get('location');
          if (!location) {
            response = res;
            break;
          }
          const fixedLocation = location.replace(/^https:\/\/([^/:]+):80(\/|$)/, 'https://$1$2');
          currentUrl = new URL(fixedLocation, currentUrl).toString();
          redirectCount++;
          continue;
        }

        response = res;
        break;
      }

      if (redirectCount > maxRedirects) {
        throw new Error(`Exceeded maximum redirect limit of ${maxRedirects} hops fetching feed.`);
      }

      if (!response) {
        throw new Error(`Failed to establish connection to feed server at ${url}`);
      }

      if (!response.ok) {
        // Try the local scraper fallback if not already tried
        console.warn(`[RSS Engine] Direct fetch failed with HTTP ${response.status}. Trying Playwright Scraper Service as final fallback...`);
        const scraped = await tryScraper(url, country);
        if (scraped) {
          rawXml = scraped;
        } else {
          const errorText = `Remote server responded with HTTP ${response.status} ${response.statusText} for ${url}`;
          console.warn(`[RSS Engine] ${errorText}`);
          throw new Error(errorText);
        }
      } else {
        const buffer = await response.arrayBuffer();
        rawXml = decodeHtmlBuffer(buffer, response.headers.get('content-type'));

        // --- HTML Detection Check ---
        const trimmedXml = rawXml.trim();
        const isHtml = trimmedXml.startsWith('<!DOCTYPE html') || 
                       trimmedXml.startsWith('<html') || 
                       trimmedXml.startsWith('<!DOCTYPE HTML') || 
                       trimmedXml.startsWith('<HTML');
                       
        if (isHtml) {
          console.warn(`[RSS Engine] Direct fetch for ${url} returned HTML content (likely bot block/private page). Trying Playwright Scraper Service...`);
          const scraped = await tryScraper(url, country);
          if (scraped) {
            rawXml = scraped;
          } else {
            throw new Error(`Access Denied: Server returned an HTML page (Cloudflare/recaptcha block or login page) instead of RSS XML.`);
          }
        }
      }

      if (!rawXml || rawXml.trim().length === 0) {
        throw new Error(`The remote server for ${url} returned an empty response.`);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Timeout fetching feed from ${url} (took more than ${FETCH_TIMEOUT_MS}ms)`);
      }
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[RSS Engine] Fetch failed for ${url}:`, errorMessage);
      if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
        throw new Error(`The feed server at ${url} is currently unreachable.`);
      }
      throw new Error(`Network error fetching feed from ${url}: ${errorMessage}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ── 1.5. RECOVER mojibake in the raw XML string if detected ───────────────
  if (hasMojibake(rawXml)) {
    const recovered = tryRecoverMojibake(rawXml);
    if (recovered) {
      console.log(`[RSS Engine] Successfully recovered mojibake in rawXml string for: ${url}`);
      rawXml = recovered;
    }
  }

  // ── 2. PARSE the raw XML string ───────────────────────────────────────────
  let feed;
  try {
    feed = await parser.parseString(rawXml);
  } catch (err: unknown) {
    console.error(`[RSS Engine] XML parse error for ${url}:`, err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse RSS XML from ${url}: ${errorMessage}`);
  }

  // ── 3. NORMALISE into FeedItem[] ──────────────────────────────────────────
  const resolvedSource = sourceName || feed.title || new URL(url).hostname;

  return (feed.items ?? []).map((item): FeedItem => {
    const rawTitle = coerceToString(item.title) || 'Untitled Article';
    const rawDescription = coerceToString(item.description || item.contentSnippet);
    const rawContent = coerceToString(item.contentEncoded || item.content || rawDescription);

    const title = rawTitle.trim();
    const description = rawDescription.trim();
    const content = rawContent.trim();

    const cleanTitle = hasMojibake(title) ? (tryRecoverMojibake(title) || title) : title;
    const cleanDescription = hasMojibake(description) ? (tryRecoverMojibake(description) || description) : description;
    const cleanContent = hasMojibake(content) ? (tryRecoverMojibake(content) || content) : content;

    const image = extractImage(item);
    const language = isArabic(cleanTitle + cleanDescription) ? 'AR' : 'EN';

    return {
      title: cleanTitle,
      link: item.link || '',
      pubDate: item.isoDate || item.pubDate || new Date().toISOString(),
      description: cleanDescription,
      content: cleanContent,
      source: resolvedSource,
      author: item.creator || (item as any).author || '',
      categories: item.categories || [],
      guid: item.guid || item.link || '',
      isoDate: item.isoDate,
      image,
      language,
      country,
      sentiment: 'Neutral', // Default for RSS stream
      sourceType: 'Online News', // Default
    };
  });
}
