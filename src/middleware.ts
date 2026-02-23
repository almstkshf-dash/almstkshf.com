import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/config";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const isPublicRoute = createRouteMatcher([
    "/",
    "/(en|ar)",
    "/contact",
    "/(en|ar)/contact",
    "/pricing",
    "/(en|ar)/pricing",
    "/case-studies(.*)",
    "/(en|ar)/case-studies(.*)",
    "/lexcora(.*)",
    "/(en|ar)/lexcora(.*)",
    "/styling-assistant(.*)",
    "/(en|ar)/styling-assistant(.*)",
    "/behind-the-scene(.*)",
    "/(en|ar)/behind-the-scene(.*)",
    "/technical-solutions(.*)",
    "/(en|ar)/technical-solutions(.*)",
    "/media-monitoring(.*)",
    "/(en|ar)/media-monitoring(.*)",
    "/api/stripe/webhook",
    "/api/stripe/checkout",
    "/api/chatbase/token",
    "/api/webhooks(.*)",
    "/sign-in(.*)",
    "/(en|ar)/sign-in(.*)",
    "/sign-up(.*)",
    "/(en|ar)/sign-up(.*)",
    "/monitoring(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
    const url = req.nextUrl;
    const isApiRoute = url.pathname.startsWith('/api');
    const isPublic = isPublicRoute(req);

    // 0. Perform Auth check
    const authObj = await auth();
    const { userId } = authObj;

    // 1. Handle API routes
    if (isApiRoute) {
        if (!isPublic && !userId) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Authentication required' },
                { status: 401 }
            );
        }
        return NextResponse.next();
    }

    // 2. Handle Public routes
    if (isPublic) {
        return intlMiddleware(req);
    }

    // 3. Protect all other non-public routes
    if (!authObj.userId) {
        return (authObj as any).protect();
    }

    // 4. Handle localized routing for protected routes
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




