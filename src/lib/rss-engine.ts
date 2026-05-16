/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import Parser from 'rss-parser';
import { FeedItem } from '@/types/rss';

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
const FETCH_TIMEOUT_MS = 15_000;

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
  // â”€â”€ 1. FETCH raw XML with spoofed headers + timeout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let rawXml: string;
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
      next: { revalidate: 900 },
    };

    response = await fetch(url, fetchOptions);

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        const fixedLocation = location.replace(/^https:\/\/([^/:]+):80(\/|$)/, 'https://$1$2');
        console.log(`[RSS Engine] Following manual redirect: ${url} -> ${fixedLocation}`);
        const nextResponse = await fetch(fixedLocation, {
          ...fetchOptions,
          redirect: 'follow',
        });
        response = nextResponse;
      }
    }

    if (!response.ok) {
      const errorText = `Remote server responded with HTTP ${response.status} ${response.statusText} for ${url}`;
      console.warn(`[RSS Engine] ${errorText}`);
      throw new Error(errorText);
    }

    rawXml = await response.text();
    
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

  // â”€â”€ 2. PARSE the raw XML string â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    const image = extractImage(item);
    const language = isArabic(title + description) ? 'AR' : 'EN';

    return {
      title,
      link: item.link || '',
      pubDate: item.isoDate || item.pubDate || new Date().toISOString(),
      description,
      content,
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
