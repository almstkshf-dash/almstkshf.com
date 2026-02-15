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
    const url = req.nextUrl.pathname;
    console.log(`[Middleware] Processing request for: ${url}`);

    try {
        // 1. Run Intl Middleware First for Public Routes
        if (isPublicRoute(req)) {
            console.log(`[Middleware] Public route detected: ${url}`);
            return intlMiddleware(req);
        }

        // 2. Protect Dashboard Routes
        if (url.includes('/dashboard')) {
            console.log(`[Middleware] Protected route detected: ${url}`);
            const { userId, redirectToSignIn } = await auth();

            if (!userId) {
                console.log(`[Middleware] Unauthorized access to dashboard. Redirecting to sign-in.`);
                return redirectToSignIn();
            }
            console.log(`[Middleware] User authenticated for dashboard: ${userId}`);
        }

        // 3. Continue with Intl Middleware for protected routes (after auth check passed)
        console.log(`[Middleware] Passing to intlMiddleware: ${url}`);

        const response = intlMiddleware(req);

        // Add Security Headers
        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
        response.headers.set(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://clerk.almstkshf.com https://*.google.com https://*.gstatic.com https://*.googletagmanager.com https://*.chatbase.co https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://*.clerk.com https://img.clerk.com https://*.google.com https://*.gstatic.com https://*.chatbase.co; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.clerk.accounts.dev https://clerk.almstkshf.com https://*.convex.cloud https://*.convex.site https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.chatbase.co https://api.stripe.com;"
        );

        return response;
    } catch (error) {
        console.error(`[Middleware] Error processing request ${url}:`, error);
        return NextResponse.next();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
