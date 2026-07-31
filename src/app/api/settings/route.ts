import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const settings = await prisma.appSettings.findUnique({
            where: { type: "global" }
        });

        if (!settings) {
            return NextResponse.json({
                type: "global",
                logoUrl: null,
                brandName: "ALMSTKSHF",
                brandTagline: "Intelligent Media Monitoring",
                footerUrl: null,
                defaults: {
                    targetCountries: ["AE", "SA", "EG"],
                    aveMultiplier: 1.5,
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error: any) {
        console.error("API /api/settings GET error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const updated = await prisma.appSettings.upsert({
            where: { type: "global" },
            update: {
                logoUrl: body.logoUrl,
                brandName: body.brandName,
                brandTagline: body.brandTagline,
                footerUrl: body.footerUrl,
                apiKeys: body.apiKeys || {},
                defaults: body.defaults || {}
            },
            create: {
                type: "global",
                logoUrl: body.logoUrl,
                brandName: body.brandName || "ALMSTKSHF",
                brandTagline: body.brandTagline,
                footerUrl: body.footerUrl,
                apiKeys: body.apiKeys || {},
                defaults: body.defaults || { targetCountries: ["AE"], aveMultiplier: 1.5 }
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("API /api/settings POST error:", error);
        return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
    }
}
