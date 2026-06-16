# Middleware Audit — almstkshf.com

> **Updated:** May 2026  
> **File:** `src/middleware.ts`  
> **Runtime:** Vercel Edge Runtime

---

## Current Implementation

The middleware composes three concerns:

1. **Edge Rate Limiting** (`rateLimit` via Upstash Redis) — runs early on sensitive endpoints (`/api/search`, `/api/monitor`) before rewrites or Clerk auth to save API credits and prevent DDoS.
2. **Clerk Auth** (`clerkMiddleware`) — wraps everything, provides `auth` context.
3. **next-intl routing** (`createMiddleware`) — locale detection and path rewriting.

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/config";

const intlMiddleware = createMiddleware(routing);

const isPublicRoute = createRouteMatcher([...]);

export default async function middleware(req: any, event: any) {
    const host = req.headers.get("host") || "";
    const isVercelPreview = host.includes("vercel.app") && !host.includes("almstkshf.com");
    const isLiveKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_live_");

    // Intercept Clerk proxy requests on Vercel preview/deployment domains to prevent them from hitting Clerk servers and returning 400
    if (req.nextUrl.pathname.startsWith("/__clerk") && isVercelPreview && isLiveKey) {
        return new NextResponse(JSON.stringify({ 
            error: "clerk_proxy_disabled_on_preview",
            message: "Clerk proxy is disabled on Vercel preview/deployment environments when using production keys." 
        }), {
            status: 200,
            headers: { 
                "Content-Type": "application/json",
                "Cache-Control": "no-store" 
            }
        });
    }

    return clerk(req, event);
}
```

---

## Public Routes (No Auth Required)

```
/                            Home page
/(en|ar)                     Locale roots
/(en|ar)/contact             Contact page
/(en|ar)/pricing             Pricing page
/(en|ar)/case-studies(.*)    Case studies
/(en|ar)/lexcora(.*)         Lexcora showcase
/(en|ar)/styling-assistant   Styling assistant showcase
/(en|ar)/behind-the-scene    Team page
/(en|ar)/technical-solutions Technical solutions
/(en|ar)/media-monitoring    Media monitoring overview
/(en|ar)/sign-in(.*)         Clerk sign-in
/(en|ar)/sign-up(.*)         Clerk sign-up
/api/stripe/webhook          Stripe webhook (must be public)
/api/stripe/checkout         Stripe checkout session
/api/chatbase/token          Chatbase JWT endpoint
/api/webhooks(.*)            Generic webhook receiver
/monitoring(.*)              Uptime/health monitoring
```

---

## Edge Runtime Constraints

The middleware runs on **Vercel Edge Runtime**, which is NOT a full Node.js environment.

### Forbidden in middleware:
- ❌ `fs` module or any Node.js file system APIs
- ❌ `process.env` (available, but some Node-specific env features are not)
- ❌ Any Convex SDK calls (`useQuery`, `useAction`, etc.)
- ❌ Database connections
- ❌ `crypto` (use `globalThis.crypto` for Web Crypto API instead)
- ❌ Dynamic imports of server-only modules

### Allowed:
- ✅ `NextRequest` / `NextResponse`
- ✅ Cookie reading/writing
- ✅ URL manipulation
- ✅ `fetch()` (Web Fetch API)
- ✅ Clerk middleware (uses Edge-compatible SDK)
- ✅ next-intl middleware

---

## Matcher Config

```typescript
export const config = {
    matcher: [
        // All paths except static files + Next.js internals
        '/((?!_next|[^?]*\\.(?:html?|css|js|json|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
```

---

## Known Issues & Fixes Applied

| Issue | Root Cause | Fix Applied |
|---|---|---|
| `MIDDLEWARE_INVOCATION_FAILED` in production | Convex or Node.js-only API in middleware | Removed all Convex calls from middleware |
| Double locale in URL (`/en/en/`) | Locale prefix applied twice | Skipped intl middleware for already-localized paths |
| API routes getting locale prefix | Intl middleware running on `/api/*` | Added early return for `/api` paths |
| Cloudflare Web Analytics `/vitals` telemetry POST failures | Cloudflare Zaraz/Web Analytics proxies telemetry to subpaths ending in `/vitals`, triggering Clerk auth protection and causing 404/401 errors | Intercepted paths ending in `/vitals` early in middleware, returning a clean `204 No Content` response immediately |
| Clerk Proxy 400 Errors on Vercel Preview | Clerk live keys reject custom domain proxying from Vercel preview domains (`*-projects.vercel.app`) | Intercepted Clerk proxy routes starting with `/__clerk` on Vercel preview domains if production keys are active, returning a clean `200 OK` with JSON to prevent `400 Bad Request` logging |
| Lack of Rate Limiting in Edge Middleware | Sensitive API routes (`/api/search`, `/api/monitor`) unprotected at Edge level, causing risk of Gemini key and API credit exhaustion | Integrated `@upstash/redis` rate limiter directly inside middleware to intercept and block excessive requests before they reach Next.js route handlers |

---

## Maintenance Rules

1. **Never add Convex imports** to this file
2. **Never add Node.js imports** (`fs`, `path`, `crypto`, etc.)
3. **Keep isPublicRoute updated** when adding new public pages
4. **Test middleware changes locally** with `npm run dev` before deploying
5. If a new API route should be public (e.g., a webhook), add it to `isPublicRoute`
