import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const plans = await prisma.crisisPlan.findMany({
            include: {
                monitorArticle: true
            }
        });
        return NextResponse.json(plans);
    } catch (error: any) {
        console.error("API /api/crisis-plans GET error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch crisis plans" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const plan = await prisma.crisisPlan.create({
            data: {
                title: body.title,
                priority: body.priority || "Medium",
                actions: body.actions || [],
                status: body.status || "Active",
                monitorId: body.monitorId || null
            }
        });
        return NextResponse.json(plan);
    } catch (error: any) {
        console.error("API /api/crisis-plans POST error:", error);
        return NextResponse.json({ error: error.message || "Failed to create crisis plan" }, { status: 500 });
    }
}
