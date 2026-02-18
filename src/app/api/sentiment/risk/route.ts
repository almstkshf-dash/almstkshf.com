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
            riskScore: data.riskScore,
            crisisProbability: data.crisisProbability,
            velocity: data.velocity,
            status: data.riskScore > 70 ? "High Risk" : data.riskScore > 40 ? "Elevated" : "Stable"
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
