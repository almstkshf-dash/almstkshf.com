import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
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
    "/api/stripe/webhook",
    "/api/stripe/checkout",
    "/api/chatbase/token",
    "/api/webhooks(.*)",
    "/(en|ar)/sign-in(.*)",
    "/sign-in(.*)",
    "/(en|ar)/sign-up(.*)",
    "/sign-up(.*)",
    "/monitoring(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
    // 1. Skip i18n for API routes
    if (req.nextUrl.pathname.startsWith('/api')) {
        return;
    }

    // 2. Protect non-public routes
    if (!isPublicRoute(req)) {
        await auth.protect();
    }

    // 3. For all other requests, apply next-intl middleware
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




