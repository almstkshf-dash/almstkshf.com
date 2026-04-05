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
    // rss-parser passes these to Node's http.request — but we bypass parseURL entirely
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
  // ── 1. FETCH raw XML with spoofed headers + timeout ──────────────────────
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let rawXml: string;
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': BROWSER_UA,
        // Prefer XML/Atom over HTML when the server does content negotiation
        Accept:
          'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7',
        'Accept-Language': 'ar,en;q=0.9',
        // Mimic a real browser referer so the server doesn't reject us
        Referer: new URL(url).origin + '/',
      },
      // Next.js data cache: cache the raw XML itself for 900s (15 min)
      // stale-while-revalidate lets a background re-fetch happen without
      // blocking in-flight requests.
      // @ts-ignore — Next.js extends the standard fetch API
      next: { revalidate: 900 },
    });

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
    throw new Error(`Network error fetching feed from ${url}: ${err.message}`);
  } finally {
    clearTimeout(timeoutId);
  }

  // ── 2. PARSE the raw XML string ───────────────────────────────────────────
  let feed: any;
  try {
    feed = await parser.parseString(rawXml);
  } catch (err: any) {
    console.error(`[RSS Engine] XML parse error for ${url}:`, err);
    throw new Error(`Failed to parse RSS XML from ${url}: ${err.message}`);
  }

  // ── 3. NORMALISE into FeedItem[] ──────────────────────────────────────────
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
