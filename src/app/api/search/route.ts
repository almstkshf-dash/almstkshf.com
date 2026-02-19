import { NextResponse } from 'next/server';
import { performSearch } from '@/lib/upstash';

export const dynamic = 'force-dynamic';

/**
 * Search API Endpoint
 * Usage: POST /api/search { "query": "...", "index": "..." }
 */
export async function POST(req: Request) {
    try {
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
