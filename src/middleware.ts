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
    "/:locale(en|ar)/contact(.*)",
    "/contact(.*)",
    "/:locale(en|ar)/pricing(.*)",
    "/pricing(.*)",
    "/:locale(en|ar)/privacy(.*)",
    "/privacy(.*)",
    "/:locale(en|ar)/terms(.*)",
    "/terms(.*)",
    "/:locale(en|ar)/behind-the-scene(.*)",
    "/behind-the-scene(.*)",
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

export default clerkMiddleware(async (auth, req) => {
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

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.(?:html?|css|js|json|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};




