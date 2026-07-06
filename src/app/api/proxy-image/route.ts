/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getRateLimitKey } from '@/lib/rateLimit';
import { isSafeUrl } from '@/utils/ssrf';

export async function GET(req: NextRequest) {
    try {
        // Apply rate limit
        const rlKey = await getRateLimitKey(req, 'proxy-image');
        const limitResult = await rateLimit(rlKey, 30, 60);
        if (!limitResult.allowed) {
            return new NextResponse('Rate limit exceeded', { 
                status: 429, 
                headers: { 'Retry-After': String(limitResult.resetSeconds) } 
            });
        }

        const { searchParams } = new URL(req.url);
        let imageUrl = searchParams.get('url');

        if (!imageUrl) {
            return new NextResponse('Missing url', { status: 400 });
        }

        if (imageUrl.startsWith('//')) {
            imageUrl = `https:${imageUrl}`;
        }

        // SSRF Guard
        if (!(await isSafeUrl(imageUrl))) {
            return new NextResponse('Invalid or forbidden URL', { status: 400 });
        }

        let response;
        try {
            response = await fetch(imageUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                signal: AbortSignal.timeout(10000)
            });
        } catch (fetchErr) {
            console.warn(`Proxy image network/timeout error for URL ${imageUrl}:`, fetchErr);
            return new NextResponse('Failed to connect to remote image host', { status: 502 });
        }

        if (!response.ok) {
            console.warn(`Failed to fetch remote image ${imageUrl} - Status: ${response.status} ${response.statusText}`);
            return new NextResponse(`Failed to fetch image: remote server returned status ${response.status}`, { 
                status: response.status === 404 ? 404 : 502 
            });
        }

        if (!response.body) {
            console.warn(`Null response body when fetching remote image ${imageUrl}`);
            return new NextResponse('Empty image response', { status: 502 });
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';

        const { readable, writable } = new TransformStream();
        response.body.pipeTo(writable).catch(err => {
            console.warn('Error piping image proxy stream:', err);
        });

        return new NextResponse(readable, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        });
    } catch (error) {
        console.warn('Unexpected proxy image error:', error);
        return new NextResponse('Error fetching image', { status: 502 });
    }
}
