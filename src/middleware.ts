import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/config";

const intlMiddleware = createMiddleware(routing);

const isPublicRoute = createRouteMatcher([
    "/",
    "/(en|ar)",
    "/(en|ar)/contact",
    "/contact",
    "/(en|ar)/pricing",
    "/pricing",
    "/(en|ar)/case-studies(.*)",
    "/case-studies(.*)",
    "/(en|ar)/lexcora(.*)",
    "/lexcora(.*)",
    "/(en|ar)/styling-assistant(.*)",
    "/styling-assistant(.*)",
    "/(en|ar)/behind-the-scene(.*)",
    "/behind-the-scene(.*)",
    "/(en|ar)/technical-solutions(.*)",
    "/technical-solutions(.*)",
    "/(en|ar)/media-monitoring(.*)",
    "/media-monitoring(.*)",
    "/(en|ar)/monitoring(.*)", // Added locale prefix for monitoring
    "/monitoring(.*)",
    "/api/stripe/webhook",
    "/api/stripe/checkout",
    "/api/chatbase/token",
    "/api/webhooks(.*)",
    "/(en|ar)/sign-in(.*)",
    "/sign-in(.*)",
    "/(en|ar)/sign-up(.*)",
    "/sign-up(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
    // 1. If it's a public route, handle with intlMiddleware directly
    if (isPublicRoute(req)) {
        return intlMiddleware(req);
    }

    // 2. Otherwise, protect and then process i18n
    await auth.protect();
    return intlMiddleware(req);
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.(?:html?|css|js|json|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};




