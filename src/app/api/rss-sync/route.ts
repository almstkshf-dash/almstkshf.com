/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { parseFeed } from '@/lib/rss-engine';
import { rateLimit, getRateLimitKey } from '@/lib/rateLimit';
import { triggerOnDemandRevalidation } from '@/utils/revalidation';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
    try {
        const rlKey = await getRateLimitKey(request, 'rss-sync');
        const limitResult = await rateLimit(rlKey, 10, 60);
        if (!limitResult.allowed) {
            return NextResponse.json({
                success: false,
                error: 'Rate limit exceeded'
            }, { status: 429, headers: { 'Retry-After': String(limitResult.resetSeconds) } });
        }

        const { url, publisher, country, lang, limit = 15 } = await request.json();

        if (!url || !publisher) {
            return NextResponse.json({ success: false, error: 'URL and Publisher are required' }, { status: 400 });
        }

        console.log(`📡 [API RSS Sync] On-demand sync for publisher: ${publisher}, URL: ${url} (Geo: ${country || 'AE'})`);

        // Fetch feed using the RSS Engine which has standard + Premium Playwright Scraper fallback
        const items = await parseFeed(url, publisher, country || 'AE');

        let savedCount = 0;
        
        // Save unique items to Convex database
        for (const item of items.slice(0, limit)) {
            // Check for duplicates
            const isDuplicate = await convex.query(api.monitoring.checkDuplicate, { url: item.link });
            if (isDuplicate) continue;

            const pubDate = item.pubDate ? new Date(item.pubDate) : null;
            const d = pubDate && !isNaN(pubDate.getTime()) ? pubDate : new Date();
            const formattedDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

            await convex.mutation(api.monitoring.saveRssArticle, {
                url: item.link,
                title: item.title,
                content: item.description,
                publishedDate: formattedDate,
                language: item.language as "EN" | "AR",
                source: publisher,
                sourceCountry: country || 'AE',
                imageUrl: item.image,
            });
            savedCount++;
        }

        console.log(`✅ [API RSS Sync] Successfully synced ${savedCount} new articles for ${publisher}`);

        if (savedCount > 0) {
            triggerOnDemandRevalidation();
        }

        return NextResponse.json({
            success: true,
            savedCount,
            message: `Successfully synced ${savedCount} new articles for ${publisher}.`
        });

    } catch (error: any) {
        console.error(`❌ [API RSS Sync] On-demand sync failed:`, error.message);
        // Return 200 OK with success: false so the frontend can display a graceful toast error
        // instead of throwing an unhandled HTTP 500 runtime exception for external server blocks.
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Failed to sync RSS feed' 
        }, { status: 200 });
    }
}
