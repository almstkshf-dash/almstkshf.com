# Dashboard Production Audit — Issues Report

---

## 🔴 CRITICAL — Breaks Production Immediately

### 1. `requireAdmin` Fails for All Users in Production
**Root cause:** `auth.ts:38` has a dev bypass (`fake_id`) gated behind `NODE_ENV !== "production"` — it never runs in prod.  
**All affected actions:**
- `fetchNews` (monitoringAction.ts:167)
- `fetchPressReleaseSources` (monitoringAction.ts:646)
- `updateSettings` (settings.ts:51)
- `fetchDeepSources` (deepSources.ts:52-53)
- `lookupEmail/Domain/IP/Username/Phone` (osint.ts)

**Fix:** Set `ADMIN_USER_IDS=user_xxx` in **Convex dashboard** Environment Variables (not .env.local, not Vercel).

---

### 2. `ConvexClientProvider.tsx` — Fallback to `localhost:3210` in Production
**File:** `src/app/ConvexClientProvider.tsx:8`
```ts
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "http://127.0.0.1:3210";
```
If `NEXT_PUBLIC_CONVEX_URL` is missing from Vercel, all queries return `undefined`. Only a `console.warn` — no user-visible error.

**Fix:** Add `NEXT_PUBLIC_CONVEX_URL` to Vercel env vars. Optionally throw in production if missing.

---

### 3. `getSettings` — Exposes All API Secrets to Unauthenticated Callers
**File:** `convex/settings.ts:5-15`

Zero auth check on a query that returns Stripe secret key, Twitter tokens, Phyllo secrets, HIBP key, etc.

**Fix:** Add `const identity = await ctx.auth.getUserIdentity(); if (!identity) throw new ConvexError("Not authenticated");`

---

### 4. `updateGeminiKey` / `setSubscriptionStatus` — No Ownership Check
**File:** `convex/userSettings.ts:50-101`

Both mutations accept `userId` from the client. Any authenticated user can overwrite any other user's key or escalate their subscription status.

**Fix:** Derive userId server-side: `const identity = await ctx.auth.getUserIdentity(); const userId = identity!.subject;`

---

### 5. `keys.ts` — `runQuery` Cast Unsafe in Query Context
**File:** `convex/utils/keys.ts:20`
```ts
const userSettings = await (ctx as ActionCtx).runQuery(...);
```
`runQuery` doesn't exist on `QueryCtx`. All current callers are actions (safe), but this is a latent crash.

---

## 🟠 HIGH — Feature Completely Non-Functional

### 6. `MediaMonitoringDashboard.tsx` — `api.queries.*` May Not Exist
**File:** `src/components/MediaMonitoringDashboard.tsx:55-56`
```tsx
const reports = useQuery(api.queries.getMediaReports, { source: filter });
const crisisPlans = useQuery(api.queries.getCrisisPlans, {});
```
If `convex/queries.ts` is missing/renamed, both hooks fail → infinite skeleton loaders on the main dashboard.

**Fix:** Verify `convex/queries.ts` exists. If not, update to `api.monitoring.getArticles`.

---

### 7. Settings "Save" Fails for Non-Admin Users
`updateSettings` calls `requireAdmin` (settings.ts:51). Non-admins get a Convex error but the UI shows the generic `t('save_failed')` with no explanation.

---

### 8. PressReleasePanel "Sync" Button Active for Non-Admins
**File:** `PressReleasePanel.tsx:167` — only checks `isAuthenticated`, but backend requires admin. Non-admin users click Sync → confusing authorization error.

---

### 9. All 5 OSINT Actions Admin-Only — No UX Indication
OSINT tab is visible to all authenticated users. Every lookup fails for non-admins with no clear message.

---

### 10. `gemini-key-resolver.ts` — `ConvexHttpClient` Has No Auth Token
**File:** `src/lib/gemini-key-resolver.ts:1-5, 34-39`
```ts
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
// No .setAuth() called — anonymous client
await convex.query(api.userSettings.get, { userId });
await convex.mutation(api.userSettings.init, { userId });  // anonymous mutation!
```
**Fix:** `const token = await auth().getToken({ template: 'convex' }); convex.setAuth(token!);`

---

### 11. Logo Upload Stored as Base64 → Exceeds Convex 1MB Document Limit
**File:** `settings/page.tsx:84-89`

`reader.readAsDataURL(file)` stores raw base64 in the `app_settings` document. A 300KB logo = ~400KB base64. Combined with all API keys in the same document, this easily exceeds Convex's 1MB limit → silent save failure in production.

**Fix:** Use Convex File Storage and store only the URL.

---

## 🟡 MEDIUM — Degrades Functionality

### 12. `saveArticle` — `sourceType` Arg is `v.string()` but Schema Requires Union Literal
**File:** `convex/monitoring.ts:68` vs `convex/schema.ts:22`

Bad sourceType values from Gemini can be inserted silently. Fix: use the same union validator in args.

### 13. `fetchNews` Returns `{ success: false }` — UI Shows No Feedback
When Gemini key is missing, the action returns an error object but some UI components don't surface it.

### 14. Two Duplicate User Settings Tables in Schema
`user_settings` (legacy, unused) and `userSettings` (active) both exist. Remove `user_settings`.

### 15. `deepSources.ts` Missing `"use node"` Directive
Low risk currently, but should be added proactively for a backend action file.

---

## 📋 Required Environment Variables

### Set in Convex Dashboard (not Vercel)
| Variable | Required |
|---|---|
| `ADMIN_USER_IDS` | 🔴 CRITICAL |
| `GEMINI_API_KEY` | 🔴 Required |
| `NEWSAPI_API_KEY` | 🟡 Optional |
| `NEWSDATA_API_KEY` | 🟡 Optional |
| `GNEWS_API_KEY` | 🟡 Optional |
| `WORLDNEWS_API_KEY` | 🟡 Optional |
| `HIBP_API_KEY` | 🟡 Optional |
| `WHOISJSON_API_KEY` | 🟡 Optional |
| `ABUSEIPDB_API_KEY` | 🟡 Optional |
| `NUMVERIFY_API_KEY` | 🟡 Optional |

### Set in Vercel
| Variable | Required |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | 🔴 CRITICAL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | 🔴 CRITICAL |
| `CLERK_SECRET_KEY` | 🔴 CRITICAL |
| `GEMINI_API_KEY` | 🔴 Required |
| `ADMIN_USER_IDS` | 🔴 Required |

---

## 🔧 Fix Priority Order

| # | File | Fix |
|---|---|---|
| 1 | Convex Dashboard | Add `ADMIN_USER_IDS` |
| 2 | Vercel | Add `NEXT_PUBLIC_CONVEX_URL` |
| 3 | `convex/settings.ts` | Add auth check to `getSettings` |
| 4 | `convex/userSettings.ts` | Derive userId from auth in mutations |
| 5 | `MediaMonitoringDashboard.tsx` | Fix `api.queries.*` import |
| 6 | `gemini-key-resolver.ts` | Pass Clerk JWT to ConvexHttpClient |
| 7 | `settings/page.tsx` | Use file storage for logo |
| 8 | Dashboard/PressReleasePanel | Show admin-only UX hints |
| 9 | `convex/monitoring.ts` | Fix sourceType arg to use union |
| 10 | `convex/schema.ts` | Remove dead `user_settings` table |
