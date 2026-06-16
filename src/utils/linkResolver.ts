/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import * as cheerio from 'cheerio';
import { isIP } from 'net';
import dns from 'dns/promises';
import { decodeHtmlBuffer } from './encoding';

const PRIVATE_IP_RANGES = [
    /^0\./,
    /^10\./,
    /^127\./,
    /^169\.254\./,
    /^172\.(1[6-9]|2\d|3[0-1])\./,
    /^192\.168\./,
];

const PRIVATE_IPV6_PREFIXES = [
    /^::$/,
    /^::1$/i,
    /^fc00:/i,
    /^fd00:/i,
    /^fe80:/i,
];

function isPrivateIp(ip: string): boolean {
    if (ip.includes(':')) {
        return PRIVATE_IPV6_PREFIXES.some((re) => re.test(ip));
    }
    return PRIVATE_IP_RANGES.some((re) => re.test(ip));
}

async function isUnsafeHostname(hostname: string): Promise<boolean> {
    const lowered = hostname.toLowerCase();
    if (lowered === 'localhost' || lowered.endsWith('.local') || lowered.endsWith('.internal')) {
        return true;
    }

    if (isIP(hostname)) {
        return isPrivateIp(hostname);
    }

    try {
        const results = await dns.lookup(hostname, { all: true });
        return results.some((entry) => isPrivateIp(entry.address));
    } catch {
        return true;
    }
}

const SHORTENER_DOMAINS = new Set([
    'bit.ly', 'bitly.com', 't.co', 'tinyurl.com', 'rebrand.ly', 'is.gd', 
    'buff.ly', 'ow.ly', 'db.tt', 'git.io', 't.me', 'lnkd.in', 'fb.me', 
    'amzn.to', 'goo.gl', 'su.pr', 'wp.me', 'short.io', 'rb.gy', 'shorturl.at',
    'tiny.cc', 'qr.ae', 'adf.ly', 'b.link', 'sniply.io', 'clicky.me'
]);

const TRACKING_PARAMS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'fbclid',
    'gclid',
    'gclsrc',
    'dclid',
    'yclid',
    'msclkid',
    'mc_eid',
    'mc_cid',
    '_hsenc',
    '_hsmi',
    'mkt_tok',
    'twclid'
];

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
        if (hostname.startsWith('www.')) {
            hostname = hostname.substring(4);
        }
        return SHORTENER_DOMAINS.has(hostname);
    } catch {
        return false;
    }
}

interface ResolvedArticle {
    finalUrl: string;
    imageUrl?: string;
    source: string;
}

function getScraperUrl(): string {
    const base = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3002';
    return base.endsWith('/scrape') ? base : `${base.replace(/\/+$/, '')}/scrape`;
}

export async function resolveUrl(
    originalUrl: string, 
    country?: string, 
    depth = 0
): Promise<ResolvedArticle | null> {
    if (depth > 3) {
        console.warn(`[LinkResolver] Exceeded maximum meta-refresh recursion depth for: ${originalUrl}`);
        return null;
    }

    try {
        let currentUrl = new URL(originalUrl).toString();
        let redirectCount = 0;
        const maxRedirects = 5;
        let response: Response | null = null;
        let standardFetchFailed = false;
        let htmlContent = '';
        let contentTypeHeader = '';

        while (redirectCount <= maxRedirects) {
            const parsed = new URL(currentUrl);
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                console.warn(`[LinkResolver] Blocked unsafe protocol in redirect chain: ${parsed.protocol}`);
                return null;
            }

            if (await isUnsafeHostname(parsed.hostname)) {
                console.warn(`[LinkResolver] Blocked unsafe hostname in redirect chain: ${parsed.hostname}`);
                return null;
            }

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);

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
                    redirect: 'manual',
                    signal: controller.signal,
                });
                clearTimeout(timeout);

                // Check for HTTP redirect
                if (res.status >= 300 && res.status < 400) {
                    const location = res.headers.get('location');
                    if (!location) {
                        response = res;
                        break;
                    }
                    // Resolve relative redirect location against current URL
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
                const buffer = await res.arrayBuffer();
                contentTypeHeader = res.headers.get('content-type') || '';
                htmlContent = decodeHtmlBuffer(buffer, contentTypeHeader);
                break;
            } catch (fetchErr) {
                clearTimeout(timeout);
                console.warn(`[LinkResolver] Standard fetch threw error for ${currentUrl}:`, fetchErr);
                standardFetchFailed = true;
                break;
            }
        }

        if (redirectCount > maxRedirects) {
            console.warn(`[LinkResolver] Exceeded maximum redirect limit of ${maxRedirects} hops.`);
            standardFetchFailed = true;
        }

        if (!standardFetchFailed && response && htmlContent) {
            const finalUrl = currentUrl;
            
            // Check for HTML meta refresh redirect
            const $ = cheerio.load(htmlContent);
            const metaRefresh = $('meta[http-equiv="refresh"]').attr('content');
            if (metaRefresh) {
                const match = metaRefresh.match(/url=(.+)$/i);
                if (match && match[1]) {
                    let redirectUrl = match[1].trim().replace(/['"]/g, '');
                    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
                        redirectUrl = new URL(redirectUrl, finalUrl).toString();
                    }
                    console.log(`[LinkResolver] Found meta-refresh redirect to: ${redirectUrl}. Resolving recursively...`);
                    return resolveUrl(redirectUrl, country, depth + 1);
                }
            }

            if (isShortenerUrl(finalUrl)) {
                console.warn(`[LinkResolver] Standard fetch resolved URL is still a shortener: ${finalUrl}. Bypassing to Premium Playwright Scraper Fallback...`);
                standardFetchFailed = true;
            } else {
                const finalParsed = new URL(finalUrl);
                if (!['http:', 'https:'].includes(finalParsed.protocol)) {
                    console.warn(`[LinkResolver] Blocked unsafe final URL protocol: ${finalParsed.protocol}`);
                    return null;
                }
                if (await isUnsafeHostname(finalParsed.hostname)) {
                    console.warn(`[LinkResolver] Blocked unsafe final URL hostname: ${finalParsed.hostname}`);
                    return null;
                }

                // Extract Image and Site Name
                const imageUrl = $('meta[property="og:image"]').attr('content') ||
                    $('meta[name="twitter:image"]').attr('content');
                const siteName = $('meta[property="og:site_name"]').attr('content') || finalParsed.hostname;

                return { finalUrl: cleanUrl(finalUrl), imageUrl, source: siteName };
            }
        }

        // --- PREMIUM FALLBACK: Premium Playwright Scraper Service ---
        try {
            const scraperParsed = new URL(originalUrl);
            if (!['http:', 'https:'].includes(scraperParsed.protocol)) {
                console.warn(`[LinkResolver] Blocked unsafe protocol before scraper invocation: ${scraperParsed.protocol}`);
                return null;
            }
            if (await isUnsafeHostname(scraperParsed.hostname)) {
                console.warn(`[LinkResolver] Blocked unsafe hostname before scraper invocation: ${scraperParsed.hostname}`);
                return null;
            }

            console.log(`[LinkResolver] Invoking Premium Playwright Scraper Service for: ${originalUrl}`);
            const scraperResponse = await fetch(getScraperUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: originalUrl,
                    country: country,
                }),
            });

            if (scraperResponse.ok) {
                const scraperData = await scraperResponse.json();
                if (scraperData.success) {
                    const resolvedUrl = scraperData.url || originalUrl;
                    const resolvedParsed = new URL(resolvedUrl);

                    if (!['http:', 'https:'].includes(resolvedParsed.protocol)) {
                        console.warn(`[LinkResolver] Scraper resolved to unsafe protocol: ${resolvedParsed.protocol}`);
                        return null;
                    }
                    if (await isUnsafeHostname(resolvedParsed.hostname)) {
                        console.warn(`[LinkResolver] Scraper resolved to unsafe hostname: ${resolvedParsed.hostname}`);
                        return null;
                    }

                    console.log(`[LinkResolver] Premium Scraper resolved successfully: ${originalUrl}`);
                    return {
                        finalUrl: cleanUrl(resolvedUrl),
                        imageUrl: scraperData.imageUrl,
                        source: scraperData.sourceName || resolvedParsed.hostname,
                    };
                }
            } else {
                console.error(`[LinkResolver] Premium Scraper service returned status: ${scraperResponse.status}`);
            }
        } catch (scraperErr: any) {
            console.error(`[LinkResolver] Premium Scraper service call failed:`, scraperErr.message);
        }

        return null;
    } catch (error) {
        console.warn(`Failed to resolve: ${originalUrl}`, error);
        return null;
    }
}
