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
    rejectUnauthorized: false,
  },
});

/**
 * Extracts a representative image URL from various RSS fields.
 */
function extractImage(item: any): string | undefined {
  // 1. Check media:content (from rss-parser custom fields)
  if (item.media && item.media.$ && item.media.$.url) {
    return item.media.$.url;
  }
  
  // 2. Check enclosures
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  
  // 3. Extract from description or content (HTML)
  const combined = (item.contentEncoded || '') + (item.description || '') + (item.content || '');
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
 * Fetches a remote RSS/Atom feed as raw XML using a spoofed browser User-Agent,
 * then parses it server-side into a standardised FeedItem array.
 */
export async function parseFeed(
  url: string,
  sourceName: string = 'RSS Feed',
  country?: string
): Promise<FeedItem[]> {
  const premiumDomains = [
    'gulfnews.com', 'khaleejtimes.com', 'thenationalnews.com', 'gulftoday.ae', 
    'skynewsarabia.com', 'emirates247.com', 'middleeasteye.net', 'prnewswire.com', 
    'aetoswire.com', 'zawya.com', 'mydubainews.com',
    'dubaichronicle.com', 'thearabianpost.com', 'saudigazette.com.sa', 
    'arabnews.com', 'aljazeera.com', 'albiladpress.com', 'twentyfoursevennews.com'
  ];

  const parsedUrl = new URL(url);
  const isPremiumDomain = premiumDomains.some(domain => parsedUrl.hostname.toLowerCase().includes(domain));
  let useScraperFallback = isPremiumDomain;
  let rawXml: string = '';

  if (useScraperFallback) {
    try {
      console.log(`[RSS Engine] Premium/protected domain detected: ${parsedUrl.hostname}. Bypassing direct fetch and routing via Playwright Scraper Service...`);
      const scraperRes = await fetch('http://localhost:3002/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, country: country || 'AE', timeout: 8000, waitAfterLoad: 0 })
      });
      if (scraperRes.ok) {
        const scraperData = await scraperRes.json();
        if (scraperData.success && scraperData.rawContent) {
          console.log(`[RSS Engine] Playwright Scraper fetched RSS XML successfully for: ${url}`);
          rawXml = scraperData.rawContent;
          useScraperFallback = false; // We successfully fetched the feed!
        } else {
          throw new Error(scraperData.error || 'Scraper failed to return rawContent');
        }
      } else {
        throw new Error(`Scraper microservice returned status ${scraperRes.status}`);
      }
    } catch (scraperErr: any) {
      console.error(`[RSS Engine] Playwright Scraper fallback failed:`, scraperErr.message);
      console.log(`[RSS Engine] Falling back to direct fetch for ${url}...`);
      useScraperFallback = false;
    }
  }

  if (!rawXml) {
    // ── 1. FETCH raw XML with spoofed headers + timeout ──────────────────────
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      const fetchOptions: RequestInit = {
        signal: controller.signal,
        redirect: 'manual',
        headers: {
          'User-Agent': BROWSER_UA,
          Accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7',
          'Accept-Language': 'ar,en;q=0.9',
          Referer: new URL(url).origin + '/',
        },
        cache: 'no-store',
      };

      response = await fetch(url, fetchOptions);

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location) {
          const fixedLocation = location.replace(/^https:\/\/([^/:]+):80(\/|$)/, 'https://$1$2');
          const redirectUrl = new URL(fixedLocation, url).toString();
          console.log(`[RSS Engine] Following manual redirect: ${url} -> ${redirectUrl}`);
          const nextResponse = await fetch(redirectUrl, {
            ...fetchOptions,
            redirect: 'follow',
          });
          response = nextResponse;
        }
      }

      if (!response.ok) {
        // Try the local scraper fallback if not already tried
        console.warn(`[RSS Engine] Direct fetch failed with HTTP ${response.status}. Trying Playwright Scraper Service as final fallback...`);
        try {
          const scraperRes = await fetch('http://localhost:3002/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, country: country || 'AE', timeout: 8000, waitAfterLoad: 0 })
          });
          if (scraperRes.ok) {
            const scraperData = await scraperRes.json();
            if (scraperData.success && scraperData.rawContent) {
              console.log(`[RSS Engine] Playwright Scraper fetched RSS XML successfully as final fallback: ${url}`);
              rawXml = scraperData.rawContent;
            }
          }
        } catch (scraperErr: any) {
          console.error(`[RSS Engine] Scraper final fallback failed:`, scraperErr.message);
        }

        if (!rawXml) {
          const errorText = `Remote server responded with HTTP ${response.status} ${response.statusText} for ${url}`;
          console.warn(`[RSS Engine] ${errorText}`);
          throw new Error(errorText);
        }
      } else {
        const buffer = await response.arrayBuffer();
        rawXml = decodeHtmlBuffer(buffer, response.headers.get('content-type'));
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

  // ── 2. PARSE the raw XML string ───────────────────────────────────────────
  let feed;
  try {
    feed = await parser.parseString(rawXml);
  } catch (err: unknown) {
    console.error(`[RSS Engine] XML parse error for ${url}:`, err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse RSS XML from ${url}: ${errorMessage}`);
  }

  // â”€â”€ 3. NORMALISE into FeedItem[] â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const resolvedSource = sourceName || feed.title || new URL(url).hostname;

  return (feed.items ?? []).map((item): FeedItem => {
    const description = item.description || item.contentSnippet || '';
    const content = item.contentEncoded || item.content || description;
    const title = (item.title || 'Untitled Article').trim();

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
