import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isDatabaseUnavailableError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return (
        message.includes("Can't reach database server") ||
        message.includes("PrismaClientInitializationError") ||
        message.includes("ECONNREFUSED") ||
        message.includes("does not exist in the current database") ||
        message.includes("relation") && message.includes("does not exist") ||
        message.includes("Undefined table")
    );
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const source = searchParams.get("source");
        const limitParam = searchParams.get("limit");
        const limit = limitParam ? parseInt(limitParam, 10) : 50;

        const where: any = {};
        if (source && source !== "All") {
            where.sourceType = source;
        }

        const articles = await prisma.mediaMonitoringArticle.findMany({
            where,
            take: limit,
            orderBy: {
                createdAt: "desc"
            }
        });

        // Convert BigInt values to numbers for JSON serialization
        const serialized = articles.map((a: any) => ({
            ...a,
            createdAt: Number(a.createdAt),
            status: "Published"
        }));

        return NextResponse.json(serialized);
    } catch (error: any) {
        console.error("API /api/monitoring/articles GET error:", error);
        const message = error?.message || "Failed to fetch articles";
        if (isDatabaseUnavailableError(error)) {
            return NextResponse.json([], { status: 200 });
        }
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const article = await prisma.mediaMonitoringArticle.create({
            data: {
                keyword: body.keyword || "General",
                url: body.url,
                title: body.title,
                content: body.content || "",
                publishedDate: body.publishedDate || new Date().toISOString(),
                language: body.language === "AR" ? "AR" : "EN",
                sentiment: body.sentiment || "Neutral",
                sourceType: body.sourceType || "OnlineNews",
                source: body.source,
                sourceCountry: body.sourceCountry || "US",
                reach: body.reach || 0,
                ave: body.ave || 0,
                createdAt: BigInt(Date.now()),
            }
        });

        return NextResponse.json({ ...article, createdAt: Number(article.createdAt) });
    } catch (error: any) {
        console.error("API /api/monitoring/articles POST error:", error);
        const message = error?.message || "Failed to create article";
        if (isDatabaseUnavailableError(error)) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
