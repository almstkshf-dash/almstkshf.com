import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/config";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const isPublicRoute = createRouteMatcher([
    "/",
    "/(en|ar)",
    "/(en|ar)/case-studies(.*)",
    "/(en|ar)/technical-solutions(.*)",
    "/(en|ar)/media-monitoring(.*)",
    "/(en|ar)/contact(.*)",
    "/(en|ar)/faq(.*)",
    "/(en|ar)/behind-the-scene(.*)",
    "/(en|ar)/pricing(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
    const { pathname } = req.nextUrl;
    console.log(`[Middleware] Processing request for: ${pathname}`);

    // 1. Bypass all check for API and internal routes
    // Handle localized API routes (e.g., /en/api/...) by rewriting them to non-localized paths
    const localizedApiMatch = pathname.match(/^\/(en|ar)(\/api\/.*)$/);
    if (localizedApiMatch) {
        const targetPath = localizedApiMatch[2];
        console.log(`[Middleware] Rewriting localized API request: ${pathname} -> ${targetPath}`);
        return NextResponse.rewrite(new URL(targetPath, req.url));
    }

    // IMPORTANT: Do NOT bypass requests starting with /api/__clerk as these are handled by Clerk Proxy
    const isClerkProxy = pathname.startsWith('/api/__clerk');

    if (!isClerkProxy && (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.'))) {
        return NextResponse.next();
    }

    try {
        // 2. Protect Dashboard Routes
        if (pathname.includes('/dashboard')) {
            console.log(`[Middleware] Protected route detected: ${pathname}`);
            await auth.protect();
        }

        // 3. Run Intl Middleware
        const response = intlMiddleware(req);

        // 4. Add Security Headers
        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

        // Slightly optimized CSP
        const csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://clerk.almstkshf.com https://*.google.com https://*.gstatic.com https://*.googletagmanager.com https://*.chatbase.co https://va.vercel-scripts.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' blob: data: https://*.clerk.com https://img.clerk.com https://*.google.com https://*.gstatic.com https://*.chatbase.co",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://*.clerk.accounts.dev https://clerk.almstkshf.com https://*.convex.cloud https://*.convex.site https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.chatbase.co https://api.stripe.com",
            "frame-src 'self' https://*.chatbase.co"
        ].join('; ');

        response.headers.set('Content-Security-Policy', csp);

        return response;
    } catch (error) {
        console.error(`[Middleware Error] ${pathname}:`, error);
        // Fallback to safety if something goes wrong to avoid 500
        return NextResponse.next();
    }
}, { proxyUrl: process.env.NEXT_PUBLIC_CLERK_PROXY_URL });

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
