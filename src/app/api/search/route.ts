import { NextResponse } from 'next/server';
import { performSearch } from '@/lib/upstash';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * Search API Endpoint
 * Usage: POST /api/search { "query": "...", "index": "..." }
 */
export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const limit = await rateLimit(`search:${ip}`, 30, 60);
        if (!limit.allowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429, headers: { 'Retry-After': String(limit.resetSeconds) } }
            );
        }

        const { query, index = "articles" } = await req.json();

        if (!query) {
            return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
        }

        const result = await performSearch(index, query);

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error("API Search Error:", error);
        return NextResponse.json(
            { error: "Search failed", details: error.message },
            { status: 500 }
        );
    }
}
