# Middleware Audit — almstkshf.com

> **Updated:** March 2026  
> **File:** `src/middleware.ts`  
> **Runtime:** Vercel Edge Runtime

---

## Current Implementation

The middleware composes two concerns:

1. **Clerk Auth** (`clerkMiddleware`) — wraps everything, provides `auth` context
2. **next-intl routing** (`createMiddleware`) — locale detection and path rewriting

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/config";

const intlMiddleware = createMiddleware(routing);

const isPublicRoute = createRouteMatcher([...]);

export default clerkMiddleware(async (auth, req) => {
    // 1. Skip i18n for API routes
    if (req.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.next();
    }
    // 2. Protect non-public routes
    if (!isPublicRoute(req)) {
        await auth.protect();
    }
    // 3. Apply intl routing
    return intlMiddleware(req);
});
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

---

## Maintenance Rules

1. **Never add Convex imports** to this file
2. **Never add Node.js imports** (`fs`, `path`, `crypto`, etc.)
3. **Keep isPublicRoute updated** when adding new public pages
4. **Test middleware changes locally** with `npm run dev` before deploying
5. If a new API route should be public (e.g., a webhook), add it to `isPublicRoute`
