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
import { rateLimit, getRateLimitKey } from '@/lib/rateLimit';
import { isSafeUrl } from '@/utils/ssrf';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
    try {
        const rlKey = await getRateLimitKey(request, 'rss-sync');
        const limitResult = await rateLimit(rlKey, 30, 60);
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

        console.log(`📡 [API RSS Sync] On-demand sync scheduled for publisher: ${publisher}, URL: ${url} (Geo: ${country || 'AE'})`);

        // SSRF validation
        if (!(await isSafeUrl(url, { allowHttp: true }))) {
            return NextResponse.json({ success: false, error: 'Invalid or forbidden URL' }, { status: 400 });
        }

        // Schedule the background sync task in Convex
        await convex.mutation(api.monitoring.scheduleRssSync, {
            url,
            publisher,
            country: country || 'AE',
            lang: lang || 'ar',
            limit,
        });

        return NextResponse.json({
            success: true,
            message: `Sync job for ${publisher} scheduled successfully in the background.`
        });

    } catch (error: any) {
        console.error(`❌ [API RSS Sync] On-demand sync scheduling failed:`, error.message);
        // Return 200 OK with success: false so the frontend can display a graceful toast error
        // instead of throwing an unhandled HTTP 500 runtime exception for external server blocks.
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Failed to schedule RSS feed sync' 
        }, { status: 200 });
    }
}
