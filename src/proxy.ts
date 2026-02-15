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
        return intlMiddleware(req);
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
