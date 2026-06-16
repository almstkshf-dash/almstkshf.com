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
    /^10\./,
    /^127\./,
    /^169\.254\./,
    /^172\.(1[6-9]|2\d|3[0-1])\./,
    /^192\.168\./,
];

const PRIVATE_IPV6_PREFIXES = [
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

export async function resolveUrl(originalUrl: string, country?: string): Promise<ResolvedArticle | null> {
    try {
        const parsed = new URL(originalUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return null;
        }

        if (await isUnsafeHostname(parsed.hostname)) {
            return null;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        let response;
        let standardFetchFailed = false;
        try {
            response = await fetch(originalUrl, {
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
                redirect: 'follow', // Ensures redirects are followed
                signal: controller.signal,
            });
            clearTimeout(timeout);

            if (!response.ok) {
                console.warn(`[LinkResolver] Standard fetch returned HTTP ${response.status}. Bypassing to Premium Playwright Scraper Fallback...`);
                standardFetchFailed = true;
            }
        } catch (fetchErr) {
            clearTimeout(timeout);
            console.warn(`[LinkResolver] Standard fetch threw error. Bypassing to Premium Playwright Scraper Fallback...`, fetchErr);
            standardFetchFailed = true;
        }

        if (!standardFetchFailed && response) {
            let finalUrl = response.url;
            
            // Check for HTML meta refresh redirect
            const buffer = await response.arrayBuffer();
            const html = decodeHtmlBuffer(buffer, response.headers.get('content-type'));
            const $ = cheerio.load(html);
            
            const metaRefresh = $('meta[http-equiv="refresh"]').attr('content');
            if (metaRefresh) {
                const match = metaRefresh.match(/url=(.+)$/i);
                if (match && match[1]) {
                    let redirectUrl = match[1].trim().replace(/['"]/g, '');
                    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
                        redirectUrl = new URL(redirectUrl, response.url).toString();
                    }
                    console.log(`[LinkResolver] Found meta-refresh redirect to: ${redirectUrl}. Resolving recursively...`);
                    return resolveUrl(redirectUrl, country);
                }
            }

            if (isShortenerUrl(finalUrl)) {
                console.warn(`[LinkResolver] Standard fetch resolved URL is still a shortener: ${finalUrl}. Bypassing to Premium Playwright Scraper Fallback...`);
                standardFetchFailed = true;
            } else {
                const finalParsed = new URL(finalUrl);
                if (await isUnsafeHostname(finalParsed.hostname)) {
                    return null;
                }

                // Extract Image and Site Name
                const imageUrl = $('meta[property="og:image"]').attr('content') ||
                    $('meta[name="twitter:image"]').attr('content');
                const siteName = $('meta[property="og:site_name"]').attr('content') || new URL(finalUrl).hostname;

                return { finalUrl: cleanUrl(finalUrl), imageUrl, source: siteName };
            }
        }

        // --- PREMIUM FALLBACK: Premium Playwright Scraper Service ---
        try {
            console.log(`[LinkResolver] Invoking Premium Playwright Scraper Service for: ${originalUrl}`);
            const scraperResponse = await fetch('http://localhost:3002/scrape', {
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
                    console.log(`[LinkResolver] Premium Scraper resolved successfully: ${originalUrl}`);
                    return {
                        finalUrl: cleanUrl(scraperData.url || originalUrl),
                        imageUrl: scraperData.imageUrl,
                        source: scraperData.sourceName || new URL(originalUrl).hostname,
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
