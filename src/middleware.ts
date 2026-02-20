import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/config";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const isPublicRoute = createRouteMatcher([
    "/",
    "/(en|ar)",
    "/(en|ar)/case-studies(.*)",
    "/(en|ar)/lexcora(.*)",
    "/(en|ar)/styling-assistant(.*)",
    "/(en|ar)/behind-the-scene(.*)",
    "/(en|ar)/contact",
    "/(en|ar)/pricing",
    "/api/stripe/webhook",
    "/api/stripe/checkout",
    "/api/chatbase/token",
    "/api/webhooks(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
    const { pathname } = req.nextUrl;

    // 1. Skip middleware for static assets (Next.js config matcher handles this, but extra safety)
    if (pathname.includes('.')) {
        return NextResponse.next();
    }

    // 2. Authentication Protection
    if (!isPublicRoute(req)) {
        await auth.protect();
    }

    // 3. Dashboard Redirect for bare /dashboard path
    if (pathname === '/dashboard') {
        const url = req.nextUrl.clone();
        url.pathname = '/en/dashboard'; // Default to English dashboard
        return NextResponse.redirect(url);
    }

    // 4. API Routes - No i18n
    if (pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // 5. Localization (next-intl)
    return intlMiddleware(req);
});

export const config = {
    matcher: [
        // Match all paths except Static Assets and Next.js internals
        '/((?!_next|[^?]*\\.(?:html?|css|js|json|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};




