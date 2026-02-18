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

    // 2. Specialized Bypass for API Routes
    if (pathname.startsWith('/api')) {
        const response = NextResponse.next();
        return applyCSP(response);
    }

    // 3. Authentication Protection
    if (!isPublicRoute(req)) {
        const authResponse = await auth.protect();
        if (authResponse instanceof Response) return authResponse;
    }

    // 4. Localization (next-intl)
    const intlResponse = intlMiddleware(req);

    // 5. Handle potential redirects from intlMiddleware
    if (intlResponse?.status >= 300 && intlResponse?.status < 400) {
        return intlResponse;
    }

    // 6. Apply Content Security Policy (CSP)
    const finalResponse = intlResponse || NextResponse.next();
    return applyCSP(finalResponse);
});

/**
 * Safely applies Content Security Policy to a response.
 */
function applyCSP(response: NextResponse | Response) {
    // Skip CSP for redirect responses as they are often immutable and don't need it
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
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "https://clerk.com",
        "https://*.clerk.accounts.dev",
        "https://*.clerkjs.dev",
        "https://js.stripe.com",
        "https://www.chatbase.co",
        "https://va.vercel-scripts.com;",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
        "img-src 'self' data: https://img.clerk.com https://*.stripe.com https://www.chatbase.co https://backend.chatbase.co https://grainy-gradients.vercel.app;",
        "font-src 'self' data: https://fonts.gstatic.com;",
        "connect-src 'self' https://*.clerk.accounts.dev https://*.convex.cloud wss://*.convex.cloud https://api.stripe.com https://www.chatbase.co https://va.vercel-scripts.com;",
        "frame-src 'self' https://js.stripe.com https://www.chatbase.co;",
        "worker-src 'self' blob: https://*.clerkjs.dev;",
        "base-uri 'self';",
        "form-action 'self';"
    ].join(' ');

    try {
        response.headers.set('Content-Security-Policy', CSP_HEADER);
        return response;
    } catch (e) {
        // Fallback for immutable headers: only clone if absolutely necessary
        const newResponse = new NextResponse(response.body, response);
        newResponse.headers.set('Content-Security-Policy', CSP_HEADER);
        return newResponse;
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

