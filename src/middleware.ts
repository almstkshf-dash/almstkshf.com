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
    "/(en|ar)/case-studies",
    "/(en|ar)/lexcora",
    "/(en|ar)/styling-assistant",
    "/(en|ar)/contact",
    "/(en|ar)/pricing",
    "/api/(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
    const { pathname } = req.nextUrl;

    // 1. Root Dashboard Redirect
    if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/en/dashboard', req.url));
    }

    // 2. Authentication Protection
    // This will now catch /dashboard, /technical-solutions, and /media-monitoring
    if (!isPublicRoute(req)) {
        await auth.protect();
    }

    // 3. Skip i18n for API routes to avoid overhead/failure in Edge Runtime
    if (pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // 4. Localization (next-intl)
    const response = intlMiddleware(req) || NextResponse.next();

    // 5. Apply Content Security Policy (CSP)
    // Only apply to HTML pages (Status 200), not redirects or static assets
    if (response.status === 200 && !pathname.includes('.')) {
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
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};



