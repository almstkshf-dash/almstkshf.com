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
    "/sign-up(.*)",
    "/monitoring(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
    // 1. If it's a public route, just let intlMiddleware handle it
    if (isPublicRoute(req)) {
        return intlMiddleware(req);
    }

    // 2. Protect non-public routes
    await auth.protect();

    // 3. Handle localization for protected routes
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




