import { NextResponse } from 'next/server';
import { parseFeed } from '@/lib/rss-engine';
import { FeedResponse } from '@/types/rss';

// Pin to Node.js runtime — rss-parser requires xml2js which is not Edge-compatible
export const runtime = 'nodejs';

/**
 * Next.js API Route for fetching and caching RSS feeds.
 * revalidate: 900 seconds (15 minutes) ensures that the server caches the response
 * and periodically refreshes it to avoid external API hits.
 */
export const revalidate = 900;

/**
 * SSRF guard: blocks requests to private/loopback networks.
 * Without this, an attacker could pass 169.254.169.254 (AWS/Vercel metadata)
 * or 10.x.x.x addresses to exfiltrate secrets from the server environment.
 */
function isSafePublicUrl(rawUrl: string): boolean {
  try {
    const { hostname, protocol } = new URL(rawUrl);
    if (protocol !== 'https:') return false;
    // Block loopback, link-local, and RFC-1918 private ranges
    const blocked = [
      /^localhost$/i,
      /^127\./,
      /^10\./,
      /^192\.168\./,
      /^172\.(1[6-9]|2\d|3[01])\./,
      /^169\.254\./,
      /^::1$/,
    ];
    return !blocked.some((re) => re.test(hostname));
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const feedUrl = searchParams.get('url');
  const sourceName = searchParams.get('source') || undefined;

  // Basic validation
  if (!feedUrl) {
    return NextResponse.json<FeedResponse>({
      success: false,
      error: 'Feed URL is required'
    }, { status: 400 });
  }

  // Security check: SSRF guard — rejects private IPs, loopback, and non-HTTPS URLs
  if (!isSafePublicUrl(feedUrl)) {
    return NextResponse.json<FeedResponse>({
      success: false,
      error: 'Only public HTTPS feed URLs are supported.'
    }, { status: 400 });
  }

  try {
    const data = await parseFeed(feedUrl, sourceName);

    // Check if we actually got items
    if (!data || data.length === 0) {
      return NextResponse.json<FeedResponse>({
        success: false,
        error: 'The RSS feed returned no updates.'
      }, { status: 404 });
    }

    // Success response with data
    return NextResponse.json<FeedResponse>({
      success: true,
      data
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=450',
      }
    });

  } catch (error) {
    console.error(`[API Feed] Caught error:`, error);
    return NextResponse.json<FeedResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal Server Error fetching RSS feed.'
    }, { status: 500 });
  }
}
