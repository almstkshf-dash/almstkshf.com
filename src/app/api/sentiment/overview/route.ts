export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const keyword = searchParams.get("keyword") || undefined;

        const data = await convex.query(api.monitoring.getAnalyticsOverview, { keyword });

        return NextResponse.json({
            success: true,
            timestamp: Date.now(),
            data
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
            }
        });
    } catch (error: any) {
        console.error("API Overview Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
