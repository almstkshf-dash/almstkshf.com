/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for Pro plan

import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { parseFeed } from '@/lib/rss-engine';
import { MEDIA_SOURCES } from '@/config/media-sources';
import { uploadImageToBlob } from '@/lib/blob-storage';
import { rateLimit, getRateLimitKey } from '@/lib/rateLimit';
import { checkAndSetSeenNextjs } from '@/lib/dedup';
import { getConvexClient } from '@/lib/convex-client';

// ── KEYWORD ALIASES & NORMALIZATION ─────────────────────────────────────────

const KEYWORD_ALIASES: Record<string, string[]> = {
    'uae': ['uae', 'emirates', 'dubai', 'abu dhabi', 'الامارات', 'دبي', 'ابوظبي', 'إمارات', 'امارات'],
    'saudi arabia': ['saudi', 'ksa', 'riyadh', 'السعوديه', 'الرياض', 'سعودية', 'سعوديه'],
    'qatar': ['qatar', 'doha', 'قطر', 'الدوحه'],
    'bahrain': ['bahrain', 'manama', 'البحرين', 'المنامه'],
    'kuwait': ['kuwait', 'الكويت'],
};

function normalizeText(text: string): string {
    if (!text) return '';
    return text
        .toLowerCase()
        // Remove punctuation
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, ' ')
        // Normalize Arabic letters
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'i') // map to normal letter for simplicity / matching
        .replace(/ى/g, 'ي')
        // Standardise whitespace
        .replace(/\s+/g, ' ')
        .trim();
}

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesKeyword(normalizedText: string, keyword: string): boolean {
    const cleanKeyword = normalizeText(keyword);
    if (!cleanKeyword) return false;

    const variants = [cleanKeyword];
    if (KEYWORD_ALIASES[cleanKeyword]) {
        variants.push(...KEYWORD_ALIASES[cleanKeyword].map(normalizeText));
    }

    for (const variant of variants) {
        // Safe boundary regex that works with English and Arabic characters
        const regex = new RegExp(`(?:^|\\s|[.,\\/#!$%\\^&\\*;:{}=\\-_~\`()?])` + escapeRegExp(variant) + `(?:$|\\s|[.,\\/#!$%\\^&\\*;:{}=\\-_~\`()?])`, 'i');
        if (regex.test(normalizedText)) {
            return true;
        }
    }
    return false;
}

// ── CUSTOM LIGHTWEIGHT CONCURRENCY LIMITER ──────────────────────────────────

async function limitConcurrency<T, R>(
    items: T[],
    fn: (item: T) => Promise<R>,
    concurrencyLimit: number
): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let currentIndex = 0;

    async function worker() {
        while (currentIndex < items.length) {
            const index = currentIndex++;
            const item = items[index];
            try {
                results[index] = await fn(item);
            } catch (err) {
                // Return fallback or let the mapper handle errors internally
            }
        }
    }

    const workers = [];
    for (let i = 0; i < Math.min(concurrencyLimit, items.length); i++) {
        workers.push(worker());
    }
    await Promise.all(workers);
    return results;
}

// ── CRON ROUTE HANDLER ──────────────────────────────────────────────────────

export async function GET(request: Request) {
    try {
        const convex = getConvexClient();
        // Apply rate limit
        const rlKey = await getRateLimitKey(request, 'cron-standard-sweep');
        const limitResult = await rateLimit(rlKey, 5, 60);
        if (!limitResult.allowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429, headers: { 'Retry-After': String(limitResult.resetSeconds) } }
            );
        }

        // 1. Verify Vercel Cron Authorization
        const authHeader = request.headers.get('authorization');
        const isProd = process.env.NODE_ENV === 'production';
        const cronSecret = process.env.CRON_SECRET;

        if (isProd && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
            console.warn('[Vercel Cron] Unauthorized attempt to trigger standard-sweep');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[Vercel Cron] Starting Standard Monitoring Sweep...');

        // 2. Seed/Update sources list in Convex from configuration on every sweep
        if (convex) {
            console.log('[Vercel Cron] Syncing media sources config to Convex...');
            await convex.mutation(api.sources.seedSources, { sources: MEDIA_SOURCES });
        }

        // 3. Fetch Settings from Convex
        const settings = convex ? await convex.query(api.settings.getSettings) : null;
        const keywords = settings?.defaults?.standardKeywords || ['UAE', 'Saudi Arabia'];
        const targetCountries = settings?.defaults?.targetCountries || ['ae', 'sa'];

        let totalRssSaved = 0;
        let totalApiSaved = 0;

        // Flatten all active feeds to sync
        const feedsToSync = MEDIA_SOURCES.flatMap(source =>
            source.feeds.map(feed => ({
                ...feed,
                sourceId: source.id,
                publisher: source.name,
                country: source.country,
            }))
        );

        // 4. Pre-fetch all RSS feeds with concurrency limit (10)
        console.log(`[Vercel Cron] Fetching ${feedsToSync.length} RSS feeds in parallel (concurrency limit = 10)...`);

        const feedResults = await limitConcurrency(feedsToSync, async (feed) => {
            const startTime = Date.now();
            try {
                const items = await parseFeed(feed.url, feed.publisher, feed.country);
                const duration = Date.now() - startTime;

                // Log health info to Convex
                if (convex) {
                    await convex.mutation(api.sources.updateSourceHealth, {
                        sourceId: feed.sourceId,
                        status: 'active',
                        responseTimeMs: duration,
                        articlesFound: items.length,
                    });
                }

                return { feed, items, success: true };
            } catch (err: any) {
                const duration = Date.now() - startTime;
                console.error(`[Vercel Cron] Fetch failed for ${feed.publisher} (${feed.url}):`, err.message || String(err));

                // Log failed status to Convex
                if (convex) {
                    await convex.mutation(api.sources.updateSourceHealth, {
                        sourceId: feed.sourceId,
                        status: 'failed',
                        responseTimeMs: duration,
                        articlesFound: 0,
                        failureMessage: err.message || String(err),
                    });
                }

                return { feed, items: [], success: false };
            }
        }, 10);

        const successfulFeeds = feedResults.filter(f => f && f.success);
        console.log(`[Vercel Cron] Pre-fetched ${successfulFeeds.length}/${feedsToSync.length} feeds successfully.`);

        // 5. Flatten & deduplicate articles by URL
        const uniqueArticlesMap = new Map<string, any>();
        for (const res of successfulFeeds) {
            if (!res) continue;
            for (const item of res.items.slice(0, 5)) { // Limit to 5 newest articles per feed
                if (!item.link) continue;
                if (!uniqueArticlesMap.has(item.link)) {
                    uniqueArticlesMap.set(item.link, {
                        item,
                        feed: res.feed,
                        matchedKeywords: [] as string[],
                    });
                }
            }
        }
        const uniqueArticles = Array.from(uniqueArticlesMap.values());

        // 6. Match keywords for each unique article
        for (const entry of uniqueArticles) {
            const { item } = entry;
            const searchStr = normalizeText(`${item.title} ${item.description} ${item.content}`);
            for (const keyword of keywords) {
                if (matchesKeyword(searchStr, keyword)) {
                    entry.matchedKeywords.push(keyword);
                }
            }
        }

        // Filter down to only articles that matched keywords
        const matchedArticles = uniqueArticles.filter(e => e.matchedKeywords.length > 0);
        console.log(`[Vercel Cron] Found ${matchedArticles.length} unique articles matching tracking keywords.`);

        // 7. Process matching articles (deduplicate and upload once per article)
        for (const entry of matchedArticles) {
            const { item, feed, matchedKeywords } = entry;
            try {
                // Check Redis dedup first (shared key space with Convex monitoringAction)
                const isSeenInRedis = await checkAndSetSeenNextjs(item.link, item.title);
                if (isSeenInRedis) continue;

                // Then check Convex DB duplicates as a secondary guard
                const isDuplicate = convex ? await convex.query(api.monitoring.checkDuplicate, { url: item.link }) : false;
                if (isDuplicate) continue;

                // Upload image once
                let blobUrl = item.image;
                if (item.image) {
                    try {
                        blobUrl = await uploadImageToBlob(item.image, 'rss-articles');
                    } catch (imgErr) {
                        console.error(`[Vercel Cron] Image upload failed for ${item.link}:`, imgErr);
                    }
                }

                // Send to /api/monitor for each matched keyword
                for (const keyword of matchedKeywords) {
                    const baseUrl = new URL(request.url).origin;
                    try {
                        const monRes = await fetch(`${baseUrl}/api/monitor`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                url: item.link,
                                keyword: keyword,
                                manualData: {
                                    title: item.title,
                                    content: item.description,
                                    imageUrl: blobUrl,
                                    date: item.pubDate,
                                    source: feed.publisher,
                                    sourceId: feed.sourceId,
                                    sourceCountry: feed.country || 'AE',
                                    sourceType: 'Press Release'
                                }
                            })
                        });
                        if (monRes.ok) {
                            totalRssSaved++;
                        } else {
                            console.error(`[Vercel Cron] Monitor API failed with status ${monRes.status} for ${item.link}`);
                        }
                    } catch (monErr) {
                        console.error(`[Vercel Cron] Monitor API call threw error for ${item.link}:`, monErr);
                    }
                }
            } catch (articleErr) {
                console.error(`[Vercel Cron] Error processing article ${item.link}:`, articleErr);
            }
        }

        // 8. Trigger Convex action for generic APIs (newsapi, newsdata, etc. for deep scanning)
        if (convex) {
            for (const keyword of keywords) {
                try {
                    const apiRes = await convex.action(api.monitoringAction.fetchNews, {
                        keyword: keyword,
                        countries: targetCountries.join(','),
                        languages: 'en,ar',
                        sourceTypes: 'Online News,Social Media,Blog'
                    });
                    if (apiRes.success) {
                        totalApiSaved += (apiRes.count || 0);
                    }
                } catch (apiErr) {
                    console.error(`[Vercel Cron] Convex fetchNews failed for keyword ${keyword}:`, apiErr);
                }
            }
        }

        console.log(`[Vercel Cron] Sweep complete. RSS Saved: ${totalRssSaved}, API Saved: ${totalApiSaved}`);
        return NextResponse.json({
            success: true,
            rssSaved: totalRssSaved,
            apiSaved: totalApiSaved
        });

    } catch (error: unknown) {
        const errStr = error instanceof Error ? error.message : String(error);
        console.error('[Vercel Cron] Fatal error:', errStr);
        return NextResponse.json({ error: errStr }, { status: 500 });
    }
}
