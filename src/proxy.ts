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

            // Explicitly redirect /dashboard to /en/dashboard to avoid 404
            if (pathname === '/dashboard') {
                console.log(`[Middleware] Redirecting /dashboard to /en/dashboard`);
                return NextResponse.redirect(new URL('/en/dashboard', req.url));
            }
        }

        // 3. Run Intl Middleware
        console.log(`[Middleware] Running Intl Middleware for: ${pathname}`);
        const response = intlMiddleware(req);

        if (!response) {
            console.error(`[Middleware Error] Intl Middleware returned no response for: ${pathname}`);
            return NextResponse.next();
        }

        // 4. Add Security Headers
        console.log(`[Middleware] Adding Security Headers for: ${pathname}`);
        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

        // Slightly optimized CSP
        const csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://clerk.almstkshf.com https://*.google.com https://*.gstatic.com https://*.googletagmanager.com https://*.chatbase.co https://va.vercel-scripts.com https://vercel.live",
            "worker-src 'self' blob: https://*.clerk.accounts.dev https://clerk.almstkshf.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' blob: data: https://*.clerk.com https://img.clerk.com https://*.google.com https://*.gstatic.com https://*.chatbase.co https://grainy-gradients.vercel.app",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://*.clerk.accounts.dev https://clerk.almstkshf.com https://*.convex.cloud https://*.convex.site https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.chatbase.co https://api.stripe.com https://vercel.live",
            "frame-src 'self' https://*.chatbase.co"
        ].join('; ');

        response.headers.set('Content-Security-Policy', csp);

        return response;
    } catch (error: any) {
        // IMPORTANT: Re-throw NEXT_REDIRECT warnings/errors so that Next.js helper methods (like auth.protect()) work properly
        if (
            error?.message?.includes('NEXT_REDIRECT') ||
            error?.digest?.includes('NEXT_REDIRECT') ||
            error?.message === 'NEXT_REDIRECT'
        ) {
            throw error;
        }

        console.error(`[Middleware Critical Error] ${pathname}:`, {
            message: error?.message,
            stack: error?.stack,
            name: error?.name
        });
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
