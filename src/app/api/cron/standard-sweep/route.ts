export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for Pro plan

import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { parseFeed } from '@/lib/rss-engine';
import { ALL_SOURCES } from '@/config/rss-sources';
import { uploadImageToBlob } from '@/lib/blob-storage';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
    try {
        // 1. Verify Vercel Cron Authorization (optional but recommended)
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            console.warn('[Vercel Cron] Unauthorized attempt to trigger standard-sweep');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[Vercel Cron] Starting Standard Monitoring Sweep...');

        // 2. Fetch Settings from Convex
        const settings = await convex.query(api.settings.getSettings);
        const keywords = settings?.defaults?.standardKeywords || ['UAE', 'Saudi Arabia'];
        const targetCountries = settings?.defaults?.targetCountries || ['ae', 'sa'];

        let totalRssSaved = 0;
        let totalApiSaved = 0;

        // 3. Process each keyword
        for (const keyword of keywords) {
            console.log(`[Vercel Cron] Processing keyword: ${keyword}`);

            // --- A. Fetch Premium RSS Sources (Using Vercel Blob for images) ---
            for (const source of ALL_SOURCES) {
                try {
                    const items = await parseFeed(source.url, source.publisher, source.country || 'ae');
                    
                    for (const item of items.slice(0, 5)) { // Limit to 5 newest per feed
                        // Skip if it doesn't match the keyword (simple inclusion check)
                        const searchStr = `${item.title} ${item.description}`.toLowerCase();
                        if (!searchStr.includes(keyword.toLowerCase())) continue;

                        // Check dedup before processing
                        const isDuplicate = await convex.query(api.monitoring.checkDuplicate, { url: item.link });
                        if (isDuplicate) continue;

                        // Upload Image to Vercel Blob
                        let blobUrl = item.image;
                        if (item.image) {
                            blobUrl = await uploadImageToBlob(item.image, 'rss-articles');
                        }

                        // Send to /api/monitor to handle Gemini analysis and AVE calculations
                        // We use the existing API so we don't duplicate logic.
                        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                        await fetch(`${baseUrl}/api/monitor`, {
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
                                    source: source.publisher,
                                    sourceCountry: source.country || 'AE',
                                    sourceType: 'Press Release'
                                }
                            })
                        });
                        totalRssSaved++;
                    }
                } catch (feedErr) {
                    console.error(`[Vercel Cron] RSS fetch failed for ${source.label}:`, feedErr);
                }
            }

            // --- B. Trigger Convex action for generic APIs ---
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
