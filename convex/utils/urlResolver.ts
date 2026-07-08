/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use node";

import * as cheerio from "cheerio";
import { FETCH_TIMEOUT, SCRAPER_TIMEOUT, MAX_REDIRECTS, MAX_META_REFRESH } from "./constants";
import { isUnsafeHostname, validateUrlOptions, getSsrfAgent } from "./ssrf";
import { decodeHtmlBuffer } from "./encoding";
import { logger } from "./logger";

const SHORTENER_DOMAINS = new Set([
    "bit.ly", "bitly.com", "t.co", "tinyurl.com", "rebrand.ly", "is.gd",
    "buff.ly", "ow.ly", "db.tt", "git.io", "t.me", "lnkd.in", "fb.me",
    "amzn.to", "goo.gl", "su.pr", "wp.me", "short.io", "rb.gy", "shorturl.at",
    "tiny.cc", "qr.ae", "adf.ly", "b.link", "sniply.io", "clicky.me",
    "news.google.com"
]);

const TRACKING_PARAMS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "fbclid",
    "gclid",
    "gclsrc",
    "dclid",
    "yclid",
    "msclkid",
    "mc_eid",
    "mc_cid",
    "_hsenc",
    "_hsmi",
    "mkt_tok",
    "twclid"
];

export function cleanUrl(urlStr: string): string {
    try {
        const url = new URL(urlStr);
        for (const param of TRACKING_PARAMS) {
            url.searchParams.delete(param);
        }
        if (url.hash && (url.hash.startsWith("#utm_") || url.hash === "#")) {
            url.hash = "";
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
        if (hostname.startsWith("www.")) {
            hostname = hostname.substring(4);
        }
        return SHORTENER_DOMAINS.has(hostname);
    } catch {
        return false;
    }
}

function getScraperUrl(): string {
    const base = process.env.SCRAPER_SERVICE_URL || "http://127.0.0.1:3002";
    return base.endsWith("/scrape") ? base : `${base.replace(/\/+$/, "")}/scrape`;
}

/**
 * SSRF-hardened URL resolver.
 */
export async function resolveUrl(
    originalUrl: string,
    depth = 0,
    dnsCache: Map<string, string[]> = new Map()
): Promise<{ finalUrl: string; imageUrl?: string; source: string } | null> {
    const log = logger.child({ requestId: "resolve-url" });

    if (depth > MAX_META_REFRESH) {
        log.warn(`Exceeded maximum meta-refresh recursion depth for: ${originalUrl}`);
        return null;
    }

    try {
        let currentUrl: string;
        try {
            currentUrl = new URL(originalUrl).toString();
        } catch {
            log.warn(`Malformed URL rejected: ${originalUrl}`);
            return null;
        }

        let entryParsed = new URL(currentUrl);
        // Validate protocol, port, credentials
        try {
            validateUrlOptions(entryParsed);
        } catch (e: any) {
            log.warn(e.message);
            return null;
        }

        if (await isUnsafeHostname(entryParsed.hostname)) {
            log.warn(`Blocked unsafe hostname on entry: ${entryParsed.hostname}`);
            return null;
        }

        let redirectCount = 0;
        let response: Response | null = null;
        let htmlContent = "";
        let contentTypeHeader = "";
        let standardFetchFailed = false;

        const ssrfAgent = getSsrfAgent(dnsCache);

        while (redirectCount < MAX_REDIRECTS) {
            const hopParsed = new URL(currentUrl);

            try {
                validateUrlOptions(hopParsed);
            } catch (e: any) {
                log.warn(e.message);
                return null;
            }

            if (await isUnsafeHostname(hopParsed.hostname)) {
                log.warn(`Blocked unsafe hostname in redirect chain: ${hopParsed.hostname}`);
                return null;
            }

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

            try {
                const res = await fetch(currentUrl, {
                    method: "GET",
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                        "Accept-Language": "en-US,en;q=0.5,ar;q=0.3",
                        "Upgrade-Insecure-Requests": "1",
                        "Sec-Fetch-Dest": "document",
                        "Sec-Fetch-Mode": "navigate",
                        "Sec-Fetch-Site": "none",
                        "Sec-Fetch-User": "?1",
                    },
                    redirect: "manual", // intercept redirects for SSRF validation
                    signal: controller.signal,
                    // Use custom SSRF-safe dispatcher for DNS Pinning
                    dispatcher: ssrfAgent,
                } as any);

                if (res.status >= 300 && res.status < 400) {
                    const location = res.headers.get("location");
                    if (!location) {
                        response = res;
                        break;
                    }
                    currentUrl = new URL(location, currentUrl).toString();
                    redirectCount++;
                    continue;
                }

                if (!res.ok) {
                    log.warn(`Standard fetch returned HTTP ${res.status} for ${currentUrl}`);
                    standardFetchFailed = true;
                    break;
                }

                response = res;
                const buffer = await res.arrayBuffer();
                contentTypeHeader = res.headers.get("content-type") || "";
                htmlContent = decodeHtmlBuffer(buffer, contentTypeHeader);
                break;
            } catch (fetchErr: any) {
                log.warn(`Fetch error for ${currentUrl}: ${fetchErr.message || fetchErr}`);
                standardFetchFailed = true;
                break;
            } finally {
                clearTimeout(timeout);
            }
        }

        if (redirectCount >= MAX_REDIRECTS) {
            log.warn(`Exceeded maximum redirect limit of ${MAX_REDIRECTS} hops.`);
            standardFetchFailed = true;
        }

        if (!standardFetchFailed && response && htmlContent) {
            const finalUrl = currentUrl;
            const $ = cheerio.load(htmlContent);

            const metaRefresh = $('meta[http-equiv="refresh"]').attr("content");
            if (metaRefresh) {
                const match = metaRefresh.match(/url=(.+)$/i);
                if (match && match[1]) {
                    let redirectUrl = match[1].trim().replace(/['"]/g, "");
                    if (!redirectUrl.startsWith("http://") && !redirectUrl.startsWith("https://")) {
                        redirectUrl = new URL(redirectUrl, finalUrl).toString();
                    }
                    log.info(`Found meta-refresh redirect to: ${redirectUrl}. Resolving recursively...`);
                    return resolveUrl(redirectUrl, depth + 1, dnsCache);
                }
            }

            if (isShortenerUrl(finalUrl)) {
                log.warn(`Resolved URL is still a shortener: ${finalUrl}. Falling back to Playwright scraper...`);
                standardFetchFailed = true;
            } else {
                const finalParsed = new URL(finalUrl);
                try {
                    validateUrlOptions(finalParsed);
                } catch (e: any) {
                    log.warn(e.message);
                    return null;
                }

                if (await isUnsafeHostname(finalParsed.hostname)) {
                    log.warn(`Blocked unsafe final URL hostname: ${finalParsed.hostname}`);
                    return null;
                }

                const imageUrl = $('meta[property="og:image"]').attr("content") ||
                    $('meta[name="twitter:image"]').attr("content");
                const siteName = $('meta[property="og:site_name"]').attr("content") || finalParsed.hostname;
                return { finalUrl: cleanUrl(finalUrl), imageUrl, source: siteName };
            }
        }

        // Playwright scraper fallback (SSRF-validated)
        try {
            const scraperParsed = new URL(originalUrl);
            try {
                validateUrlOptions(scraperParsed);
            } catch (e: any) {
                log.warn(e.message);
                return null;
            }

            if (await isUnsafeHostname(scraperParsed.hostname)) {
                log.warn(`Blocked unsafe hostname before scraper invocation: ${scraperParsed.hostname}`);
                return null;
            }

            log.info(`Invoking Playwright Scraper Service for: ${originalUrl}`);
            const scraperController = new AbortController();
            const scraperTimeout = setTimeout(() => scraperController.abort(), SCRAPER_TIMEOUT);

            try {
                const scraperRes = await fetch(getScraperUrl(), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: originalUrl, timeout: 12000, waitAfterLoad: 0 }),
                    signal: scraperController.signal,
                });

                if (scraperRes.ok) {
                    const scraperData = await scraperRes.json() as any;
                    if (scraperData.success) {
                        const resolvedUrl = scraperData.url || originalUrl;
                        const resolvedParsed = new URL(resolvedUrl);

                        try {
                            validateUrlOptions(resolvedParsed);
                        } catch (e: any) {
                            log.warn(e.message);
                            return null;
                        }

                        if (await isUnsafeHostname(resolvedParsed.hostname)) {
                            log.warn(`Scraper resolved to unsafe hostname: ${resolvedParsed.hostname}`);
                            return null;
                        }

                        log.info(`Playwright Scraper successfully resolved: ${originalUrl}`);
                        return {
                            finalUrl: cleanUrl(resolvedUrl),
                            imageUrl: scraperData.imageUrl || undefined,
                            source: scraperData.sourceName || resolvedParsed.hostname
                        };
                    }
                } else {
                    log.error(`Playwright Scraper service returned status: ${scraperRes.status}`);
                }
            } finally {
                clearTimeout(scraperTimeout);
            }
        } catch (scraperErr: any) {
            log.error(`Playwright Scraper fallback failed for ${originalUrl}: ${scraperErr.message || scraperErr}`);
        }

        return null;
    } catch (error: any) {
        log.warn(`Failed to resolve: ${originalUrl}`, error);
        return null;
    }
}
