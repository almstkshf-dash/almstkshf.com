import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/config";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

// Routes that are publicly accessible without authentication
const isPublicRoute = createRouteMatcher([
    "/",
    "/(en|ar)", // Landing Page
    "/(en|ar)/case-studies",
    "/(en|ar)/lexcora",
    "/(en|ar)/styling-assistant",
    "/(en|ar)/technical-solutions/(.*)",
    "/(en|ar)/media-monitoring/(.*)",
    "/(en|ar)/contact",
    "/(en|ar)/pricing",
    "/api/(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
    const { pathname } = req.nextUrl;

    // 1. Specialized Redirect for /dashboard to Avoid 404 (Root to Locale)
    if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/en/dashboard', req.url));
    }

    // 2. Authentication Protection
    // Note: We don't use try-catch here because Clerk v6 uses internal exceptions 
    // for redirects which should not be caught and swallowed.
    if (!isPublicRoute(req)) {
        await auth.protect();
    }

    // 3. Localization (next-intl)
    const response = intlMiddleware(req);

    // 4. Apply Content Security Policy (CSP) to valid page responses
    // Only apply to HTML pages, not static assets or API routes
    if (response && !pathname.startsWith('/api') && !pathname.includes('.')) {
        const CSP_HEADER = [
            "default-src 'self';",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.com https://clerk.almstkshf.com https://*.clerk.com https://*.clerk.accounts.dev https://*.clerkjs.dev https://js.stripe.com https://*.stripe.com https://www.chatbase.co https://*.chatbase.co https://va.vercel-scripts.com https://*.vercel.live https://cdn.jsdelivr.net blob:;",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.vercel.live https://cdn.jsdelivr.net;",
            "img-src 'self' data: https: https://img.clerk.com https://*.clerk.com https://*.stripe.com https://www.chatbase.co https://backend.chatbase.co https://grainy-gradients.vercel.app https://*.vercel.live https://cdn.jsdelivr.net;",
            "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net;",
            "connect-src 'self' https://clerk.com https://*.clerk.com https://clerk.almstkshf.com https://*.clerk.accounts.dev https://*.convex.cloud wss://*.convex.cloud https://*.convex.site wss://*.convex.site https://api.stripe.com https://*.stripe.com https://www.chatbase.co https://backend.chatbase.co https://*.chatbase.co https://va.vercel-scripts.com https://*.vercel.live wss://*.vercel.live https://cdn.jsdelivr.net https://*.upstash.io blob:;",
            "frame-src 'self' https://js.stripe.com https://*.stripe.com https://www.chatbase.co https://*.chatbase.co https://*.clerk.com https://*.vercel.live;",
            "worker-src 'self' blob: https://*.clerkjs.dev;",
            "base-uri 'self';",
            "form-action 'self';"
        ].join(' ');

        response.headers.set('Content-Security-Policy', CSP_HEADER);
    }

    return response;
});

export const config = {
    matcher: [
        // Match all paths except Static Assets and Next.js internals
        // Using a more robust negative lookahead for Clerk stability in production
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};


