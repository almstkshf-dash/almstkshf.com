/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/config";

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
    if (req.nextUrl.pathname.endsWith("/vitals")) {
        return new NextResponse(null, { status: 204 });
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
    if (localeApiRegex.test(pathname)) {
        const strippedPath = pathname.replace(/^\/(ar|en)/, "");
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
