# 🩺 Production Audit: Middleware & Internal Server Error

This document provides a comprehensive analysis of the `500: INTERNAL_SERVER_ERROR` / `MIDDLEWARE_INVOCATION_FAILED` issue encountered in the production environment.

## 1. Middleware Analysis (`src/middleware.ts`)

- **Edge Runtime Compatibility**: 
    - [x] **No Node.js APIs**: The middleware does not use `fs`, `path`, or `process.binding`.
    - [x] **Safe Crypto**: No usage of Node's `crypto` module.
    - [x] **No Convex Imports**: Confirmed that `convex` hooks or clients are NOT imported.
- **Redirects & Rewrites**: 
    - The `/dashboard` redirect uses standard `NextResponse.redirect`.
    - Internationalization is handled by `next-intl/middleware`, which is Edge-compatible.
- **CSP Headers**: 
    - The `applyCSP` function uses `NextResponse` and standard header manipulation.
    - **Note**: The `try-catch` block handles immutable headers by cloning the response, which is a safe pattern.

## 2. Convex Integration

- **Environment**: All Convex calls are restricted to Client Components (`useQuery`, `useMutation`) or Server Actions/Components.
- **Deployment URL**: 
    > [!IMPORTANT]
    > Verify that `NEXT_PUBLIC_CONVEX_URL` in Vercel matches the production deployment URL in the Convex dashboard.
- **Auth**: Clerk-Convex integration (JWT) is correctly handled via headers; no direct Convex DB access occurs in the middleware.

## 3. Vercel Environment Configuration

- **Environment Variables**:
    - Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are present in Vercel.
    - Confirm `CONVEX_DEPLOYMENT` is set for the production environment.
- **Edge Functions Logs**: 
    - Check Vercel **Logs** -> **Edge Functions**. Look for "Execution timed out" or "Memory limit exceeded".

## 4. configuration Analysis (`next.config.mjs`)

- **Matcher**: The middleware matcher correctly excludes static assets:
  ```typescript
  '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'
  ```
- **Experimental Features**: `optimizePackageImports` is enabled, which helps reduce middleware bundle size.

## 5. Potential Root Causes

1. **Bundle Size**: If the middleware bundle (including dependencies like `lucide-react` or `framer-motion`) exceeds the Edge limit (1MB-2MB), it will fail to invoke.
2. **Environment Variable Discrepancy**: A missing `NEXT_PUBLIC_...` variable that the middleware expects (e.g., for CSP logic) might trigger a crash if not handled.
3. **Clerk Key Type**: If `process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` contains `_test_` in a production environment, it triggers a `console.warn` but shouldn't crash the invocation unless Clerk's internals handle it differently.

## 6. Recommended Fixes

- [ ] **Simplify Middleware**: Move the CSP logic to `layout.tsx` via `<meta http-equiv="Content-Security-Policy" ...>` if the middleware continues to fail.
- [ ] **Environment Audit**: Triple-check that ALL variables in `.env.local` are mirrored in Vercel.
- [ ] **Dependency Audit**: Ensure `@clerk/nextjs` is up to date (currently `^6.37.3`).

---
*Created on: 2026-02-19*
