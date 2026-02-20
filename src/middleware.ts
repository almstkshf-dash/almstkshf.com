import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/config";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

// Routes that are strictly public (Marketing, Pricing, Landing)
// Removed broad (.*) patterns for technical-solutions and media-monitoring to restore mandatory login
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
    "/api/chatbase/token"
]);

const CSP_HEADER = [
    "default-src 'self';",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.com https://*.clerk.com https://*.clerk.accounts.dev https://*.clerkjs.dev https://js.stripe.com https://*.stripe.com https://www.chatbase.co https://*.chatbase.co https://va.vercel-scripts.com https://*.vercel.live https://cdn.jsdelivr.net blob:;",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.vercel.live https://cdn.jsdelivr.net;",
    "img-src 'self' data: https: https://img.clerk.com https://*.clerk.com https://*.stripe.com https://www.chatbase.co https://backend.chatbase.co https://grainy-gradients.vercel.app https://*.vercel.live https://cdn.jsdelivr.net;",
    "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net;",
    "connect-src 'self' https://clerk.com https://*.clerk.com https://clerk.almstkshf.com https://*.clerk.accounts.dev https://*.convex.cloud wss://*.convex.cloud https://*.convex.site wss://*.convex.site https://api.stripe.com https://*.stripe.com https://www.chatbase.co https://backend.chatbase.co https://*.chatbase.co https://va.vercel-scripts.com https://*.vercel.live wss://*.vercel.live https://cdn.jsdelivr.net https://*.upstash.io blob:;",
    "frame-src 'self' https://js.stripe.com https://*.stripe.com https://www.chatbase.co https://*.chatbase.co https://*.clerk.com https://*.vercel.live;",
    "worker-src 'self' blob: https://*.clerkjs.dev;",
    "base-uri 'self';",
    "form-action 'self';"
].join(' ').replace(/\s{2,}/g, ' ').trim();

export default clerkMiddleware(async (auth, req) => {
    const { pathname } = req.nextUrl;

    // 1. Authentication Protection (Priority)
    if (!isPublicRoute(req)) {
        await auth.protect();
    }

    // 2. Root Dashboard Redirect
    if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/en/dashboard', req.url));
    }

    // 3. Skip i18n for API routes
    if (pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // 4. Localization (next-intl)
    const response = intlMiddleware(req) || NextResponse.next();

    // 5. Apply Content Security Policy (CSP)
    if (response && response.status === 200 && !pathname.includes('.')) {
        try {
            response.headers.set('Content-Security-Policy', CSP_HEADER);
        } catch (e) {
            console.error("Failed to set CSP header:", e);
        }
    }

    return response;
});

export const config = {
    matcher: [
        // Match all paths except Static Assets and Next.js internals
        // Explicitly exclude .json files to avoid unnecessary middleware execution on translations
        '/((?!_next|[^?]*\\.(?:html?|css|js|json|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};



