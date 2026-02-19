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
    try {
        const { pathname } = req.nextUrl;

        // 1. Specialized Redirect for /dashboard to Avoid 404 (Root to Locale)
        if (pathname === '/dashboard') {
            return NextResponse.redirect(new URL('/en/dashboard', req.url));
        }

        // 2. Specialized Bypass for API Routes (including localized /en/api)
        if (pathname.startsWith('/api') || pathname.match(/\/(en|ar)\/api/)) {
            return applyCSP(NextResponse.next());
        }

        // 3. Authentication Protection
        if (!isPublicRoute(req)) {
            try {
                const authResult = await auth.protect();
                // If Clerk returns a redirect, return it immediately
                if (authResult instanceof Response) return authResult;
            } catch (authError) {
                console.error("MIDDLEWARE_AUTH_PROTECT_FAILED:", authError);
                // Fallback to let it pass if auth.protect failed unexpectedly
                return applyCSP(NextResponse.next());
            }
        }

        // 4. Localization (next-intl)
        const intlResponse = intlMiddleware(req);

        // 5. Handle potential redirects from intlMiddleware (Must be returned without header modification if immutable)
        if (intlResponse && intlResponse.status >= 300 && intlResponse.status < 400) {
            return intlResponse;
        }

        // 6. Apply Content Security Policy (CSP)
        // We pass the response to applyCSP which will return a new response with headers if needed
        return applyCSP(intlResponse || NextResponse.next());
    } catch (globalError: any) {
        console.error("MIDDLEWARE_GLOBAL_CRASH:", globalError?.message || globalError);
        // Fallback to a standard next response to avoid MIDDLEWARE_INVOCATION_FAILED
        try {
            return applyCSP(NextResponse.next());
        } catch (e) {
            return NextResponse.next();
        }
    }
});

/**
 * Safely applies Content Security Policy to a response.
 * Creates a new response if headers are immutable.
 */
function applyCSP(response: Response) {
    if (!response) return NextResponse.next();

    // 1. Skip CSP for redirect responses as they are often immutable and don't render content
    if (response.status >= 300 && response.status < 400) {
        return response;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    if (isProduction && clerkPubKey?.includes('_test_')) {
        console.warn("CRITICAL SECURITY WARNING: Clerk development keys detected in production environment!");
    }

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

    // 2. Try to set the header. If it fails due to immutability, create a new response.
    try {
        response.headers.set('Content-Security-Policy', CSP_HEADER);
        return response;
    } catch (e) {
        // Response headers are immutable (common with some Clerk/Redirect responses)
        // We create a new response instance with the same body and merged headers
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Content-Security-Policy', CSP_HEADER);
        
        // Use NextResponse to clone the response with modified headers
        return NextResponse.next({
            request: {
                headers: newHeaders,
            }
        });
    }
}

export const config = {
    matcher: [
        // Match all paths except Static Assets and Next.js internals
        '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
        // Ensure API routes are handled
        '/api/(.*)',
    ],
};

