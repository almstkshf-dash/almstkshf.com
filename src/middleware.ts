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
  try {
    const isApiRoute = req.nextUrl.pathname.startsWith('/api');
    const isPublic = isPublicRoute(req);

    // 1. Return early for API routes
    if (isApiRoute) {
      return NextResponse.next();
    }

    // 2. Protect non-public routes
    if (!isPublic) {
      await auth.protect();
    }

    // 3. Apply next-intl middleware
    return intlMiddleware(req);
  } catch (error) {
    // Edge Runtime: log the real error, never crash silently
    console.error("[middleware] invocation failed:", error);
    
    // Fail safe: If it's a public route, let it through. 
    // If it's protected, redirect to sign-in.
    if (isPublicRoute(req)) {
      return intlMiddleware(req);
    }
    
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, but run for everything else
        '/((?!_next|[^?]*\\.(?:html?|css|js|json|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};




