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
const parser: any = new Parser({
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
 * Fetches a remote RSS/Atom feed as raw XML using a spoofed browser User-Agent,
 * then parses it server-side into a standardised FeedItem array.
 *
 * Bypassing parseURL gives us:
 *  1. Full header control (User-Agent, Accept, Accept-Language)
 *  2. A hard timeout via AbortController
 *  3. Compatibility with Vercel's `fetch` instrumentation for data caching
 *
 * @param url        The HTTPS RSS/Atom feed URL.
 * @param sourceName Optional display name; falls back to the feed's own title or hostname.
 * @returns          Array of normalised FeedItem objects.
 * @throws           Error with a human-readable message on network or parse failure.
 */
export async function parseFeed(
  url: string,
  sourceName: string = 'RSS Feed'
): Promise<FeedItem[]> {
  // â”€â”€ 1. FETCH raw XML with spoofed headers + timeout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let rawXml: string;
  let response: Response;
  try {
    // We use redirect: 'manual' to catch broken redirects (like aawsat.com redirecting to :80 on HTTPS)
    // and fix them before following.
    response = await fetch(url, {
      signal: controller.signal,
      redirect: 'manual',
      headers: {
        'User-Agent': BROWSER_UA,
        Accept:
          'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7',
        'Accept-Language': 'ar,en;q=0.9',
        Referer: new URL(url).origin + '/',
      },
      // @ts-ignore
      next: { revalidate: 900 },
    });

    // Handle redirects manually to fix broken Location headers (common in some Arabic news servers)
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        // Fix for broken redirects: some servers redirect https://domain.com/... to https://domain.com:80/...
        // Port 80 is for HTTP, so browsers and node-fetch fail the TLS handshake on a :80 port.
        const fixedLocation = location.replace(/^https:\/\/([^/:]+):80(\/|$)/, 'https://$1$2');

        console.log(`[RSS Engine] Following manual redirect: ${url} -> ${fixedLocation}`);

        // Follow the redirect once
        const nextResponse = await fetch(fixedLocation, {
          signal: controller.signal,
          headers: {
            'User-Agent': BROWSER_UA,
            Accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7',
            'Accept-Language': 'ar,en;q=0.9',
            Referer: new URL(url).origin + '/',
          },
          // @ts-ignore
          next: { revalidate: 900 },
        });
        response = nextResponse;
      }
    }

    if (!response.ok) {
      throw new Error(
        `Remote server responded with HTTP ${response.status} ${response.statusText} for ${url}`
      );
    }

    rawXml = await response.text();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(
        `Feed request timed out after ${FETCH_TIMEOUT_MS / 1000}s: ${url}`
      );
    }
    // If we get a TLS/SSL error (common on Windows with broken port redirects),
    // it will be caught here but handled by our manual redirect above now.
    throw new Error(`Network error fetching feed from ${url}: ${err.message}`);
  } finally {
    clearTimeout(timeoutId);
  }

  // â”€â”€ 2. PARSE the raw XML string â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let feed: any;
  try {
    feed = await parser.parseString(rawXml);
  } catch (err: any) {
    console.error(`[RSS Engine] XML parse error for ${url}:`, err);
    throw new Error(`Failed to parse RSS XML from ${url}: ${err.message}`);
  }

  // â”€â”€ 3. NORMALISE into FeedItem[] â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const resolvedSource = sourceName || feed.title || new URL(url).hostname;

  return (feed.items ?? []).map((item: any): FeedItem => {
    const description = item.description || item.contentSnippet || '';
    const content = item.contentEncoded || item.content || description;

    return {
      title: (item.title || 'Untitled Article').trim(),
      link: item.link || '',
      pubDate: item.isoDate || item.pubDate || new Date().toISOString(),
      description,
      content,
      source: resolvedSource,
      author: item.creator || item.author || '',
      categories: item.categories || [],
      guid: item.guid || item.link || '',
      isoDate: item.isoDate,
    };
  });
}
