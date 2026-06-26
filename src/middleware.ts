/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { clerkMiddleware, createRouteMatcher, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/config";
import { rateLimit, getRateLimitKey } from "./lib/rateLimit";

const intlMiddleware = createMiddleware(routing);

const isPublicRoute = createRouteMatcher([
    "/",
    "/:locale(en|ar)",
    "/:locale(en|ar)/about-us(.*)",
    "/about-us(.*)",
    "/:locale(en|ar)/contact(.*)",
    "/contact(.*)",
    "/:locale(en|ar)/pricing(.*)",
    "/pricing(.*)",
    "/:locale(en|ar)/privacy(.*)",
    "/privacy(.*)",
    "/:locale(en|ar)/terms(.*)",
    "/terms(.*)",
    "/:locale(en|ar)/case-studies(.*)",
    "/case-studies(.*)",
    "/:locale(en|ar)/lexcora(.*)",
    "/lexcora(.*)",
    "/:locale(en|ar)/styling-assistant(.*)",
    "/styling-assistant(.*)",
    "/:locale(en|ar)/technical-solutions(.*)",
    "/technical-solutions(.*)",
    "/:locale(en|ar)/media-monitoring(.*)",
    "/media-monitoring(.*)",
    "/:locale(en|ar)/monitoring(.*)",
    "/monitoring(.*)",
    "/:locale(en|ar)/inspect(.*)",
    "/inspect(.*)",
    "/:locale(en|ar)/payment(.*)",
    "/payment(.*)",
    "/api/stripe/webhook",
    "/api/stripe/checkout",
    "/api/chatbase/token",
    "/api/webhooks(.*)",
    "/:locale(en|ar)/sign-in(.*)",
    "/sign-in(.*)",
    "/:locale(en|ar)/sign-up(.*)",
    "/sign-up(.*)",
    "/api/proxy-rss"
]);

const clerk = clerkMiddleware(async (auth, req) => {
    // Skip Clerk internal requests to prevent 400 Bad Request / infinite protect loops
    if (req.nextUrl.pathname.startsWith("/__clerk")) {
        return NextResponse.next();
    }

    // Handle vitals beacons gracefully with 204 No Content to avoid Clerk interception/Next.js overhead
    // Include CORS headers to prevent preflight OPTIONS or telemetry POST fetch failures
    if (req.nextUrl.pathname.endsWith("/vitals")) {
        return new NextResponse(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            }
        });
    }

    // 0. Skip localization for API routes
    if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    // 1. If it's a public route, handle with intlMiddleware directly
    if (isPublicRoute(req)) {
        return intlMiddleware(req);
    }

    // 2. Otherwise, protect and then process i18n
    await auth.protect();
    return intlMiddleware(req);
});

export default async function middleware(req: any, event: any) {
    const pathname = req.nextUrl.pathname;
    const localeApiRegex = /^\/(ar|en)\/api\//;
    let strippedPath = pathname;
    if (localeApiRegex.test(pathname)) {
        strippedPath = pathname.replace(/^\/(ar|en)/, "");
    }

    // Apply Rate Limiting to /api/search and /api/monitor
    if (strippedPath === "/api/search" || strippedPath === "/api/monitor") {
        try {
            // Get Clerk auth to find userId if authenticated
            let userId: string | null = null;
            try {
                const authData = getAuth(req);
                userId = authData?.userId || null;
            } catch (authError) {
                // Ignore auth retrieval errors in middleware and fallback to IP-based rate limiting
            }

            const isSearch = strippedPath === "/api/search";
            const method = req.method;
            
            let limitCount = 60;
            let windowSeconds = 60;
            let prefix = "";

            if (isSearch) {
                // /api/search only accepts POST requests
                if (method === "POST") {
                    limitCount = 30;
                    windowSeconds = 60;
                    prefix = "search";
                } else {
                    return new NextResponse(JSON.stringify({ error: "Method not allowed" }), {
                        status: 405,
                        headers: { "Content-Type": "application/json" }
                    });
                }
            } else {
                // /api/monitor has GET and POST
                if (method === "POST") {
                    limitCount = 15;
                    windowSeconds = 60;
                    prefix = "monitor:post";
                } else if (method === "GET") {
                    limitCount = 60;
                    windowSeconds = 60;
                    prefix = "monitor:get";
                } else {
                    return new NextResponse(JSON.stringify({ error: "Method not allowed" }), {
                        status: 405,
                        headers: { "Content-Type": "application/json" }
                    });
                }
            }

            const rlKey = await getRateLimitKey(req, prefix, userId);
            const rlResult = await rateLimit(rlKey, limitCount, windowSeconds);

            if (!rlResult.allowed) {
                return new NextResponse(
                    JSON.stringify({ error: "Rate limit exceeded" }),
                    {
                        status: 429,
                        headers: {
                            "Content-Type": "application/json",
                            "Retry-After": String(rlResult.resetSeconds)
                        }
                    }
                );
            }
        } catch (rlError) {
            console.error("Middleware rate limiting error:", rlError);
        }
    }

    if (localeApiRegex.test(pathname)) {
        const url = req.nextUrl.clone();
        url.pathname = strippedPath;
        return NextResponse.rewrite(url);
    }

    const host = req.headers.get("host") || "";
    const isVercelPreview = host.includes("vercel.app") && !host.includes("almstkshf.com");
    const isLiveKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_live_");

    // Intercept Clerk proxy requests on Vercel preview/deployment domains to prevent them from hitting Clerk servers and returning 400
    if (req.nextUrl.pathname.startsWith("/__clerk") && isVercelPreview && isLiveKey) {
        return new NextResponse(JSON.stringify({ 
            error: "clerk_proxy_disabled_on_preview",
            message: "Clerk proxy is disabled on Vercel preview/deployment environments when using production keys." 
        }), {
            status: 200,
            headers: { 
                "Content-Type": "application/json",
                "Cache-Control": "no-store" 
            }
        });
    }

    return clerk(req, event);
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.(?:html?|css|js|json|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
