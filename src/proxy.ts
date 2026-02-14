import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/config";

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
    // If it's not a public route, protect it
    if (!isPublicRoute(req)) {
        // Only protect if it's not internal or static
        const isInternal = req.nextUrl.pathname.startsWith('/_next') ||
            req.nextUrl.pathname.startsWith('/api') ||
            req.nextUrl.pathname.includes('.');

        if (!isInternal && req.nextUrl.pathname.includes('/dashboard')) {
            await (await auth()).protect();
        }
    }

    return intlMiddleware(req);
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
