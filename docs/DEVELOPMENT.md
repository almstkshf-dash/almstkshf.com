# Developer Guide

> **Environment:** Node.js 20+ · Windows/Mac/Linux · VSCode recommended

---

## 1. Local Setup

### Prerequisites
- Node.js ≥ 20
- npm ≥ 10
- A [Convex](https://convex.dev) account
- A [Clerk](https://clerk.com) account
- Stripe test keys
- Google Gemini API key

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in your keys
cp .env.local.example .env.local

# 3. Start both Next.js and Convex in parallel
npm run dev
# → Next.js runs on http://localhost:3001
# → Convex dev server syncs schema and functions
```

---

## 2. Environment Variables

All of the following must be set in `.env.local` for local development and in **Vercel project settings** for production.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | ✅ | Convex deployment URL |
| `CONVEX_DEPLOY_KEY` | ✅ | Convex deploy key (CI/CD only) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | ✅ | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | ✅ | `/sign-up` |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe publishable key |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key (system fallback) |
| `RESEND_API_KEY` | ✅ | Resend email API key |
| `CHATBASE_SECRET_KEY` | ✅ | For JWT signing in `/api/chatbase/token` |
| `CHATBASE_CHATBOT_ID` | ✅ | Chatbase chatbot identifier |
| `UPSTASH_REDIS_REST_URL` | ✅ | Upstash Redis URL (rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Upstash Redis token |
| `UPSTASH_SEARCH_REST_URL` | optional | Upstash Search (search API) |
| `UPSTASH_SEARCH_REST_TOKEN` | optional | Upstash Search token |
| `NEWSDATA_API_KEY` | optional | NewsData.io (stored also in app_settings) |
| `NEWSAPI_KEY` | optional | NewsAPI.org |
| `GNEWS_API_KEY` | optional | GNews.io |
| `WORLDNEWS_API_KEY` | optional | World News API (deep sources) |
| `PHYLLO_CLIENT_ID` | optional | Phyllo social SDK |
| `PHYLLO_CLIENT_SECRET` | optional | Phyllo social SDK |

> ⚠️ **Important:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secret keys in `NEXT_PUBLIC_` variables.

---

## 3. npm Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `concurrently next:dev convex:dev` | Start full dev environment |
| `npm run build` | `next build` | Production build |
| `npm run start` | `next start` | Start production server locally |
| `npm run lint` | `eslint` | Run ESLint |
| `npm run cypress:open` | — | Open Cypress interactive test runner |
| `npm run e2e:headless` | — | Run E2E tests headless |

---

## 4. Project Structure

```
almstkshf.com/
├── convex/                 # Convex backend
│   ├── schema.ts           # Database schema (12 tables)
│   ├── monitoring.ts       # Media articles queries/mutations
│   ├── monitoringAction.ts # Node.js action: fetches from news APIs
│   ├── deepSources.ts      # Deep web scanning actions
│   ├── osint.ts            # OSINT lookups (email, domain, IP, username, phone)
│   ├── osintDb.ts          # OSINT DB CRUD
│   ├── settings.ts         # App global settings
│   ├── userSettings.ts     # Per-user settings (subscription, trial, API key)
│   ├── payments.ts         # Payment & subscription mutations
│   ├── contact.ts          # Contact form → Resend email
│   ├── crons.ts            # Scheduled jobs
│   └── auth.config.ts      # Clerk → Convex auth
│
├── src/
│   ├── middleware.ts        # Edge: Clerk auth + next-intl routing
│   ├── app/
│   │   ├── [locale]/       # All pages (en + ar)
│   │   │   ├── layout.tsx  # Root layout (Navbar, Footer, providers)
│   │   │   ├── page.tsx    # Home
│   │   │   ├── dashboard/  # Main dashboard (protected)
│   │   │   ├── pricing/    # Stripe checkout integration
│   │   │   ├── contact/    
│   │   │   ├── case-studies/
│   │   │   ├── media-monitoring/
│   │   │   └── technical-solutions/
│   │   ├── api/
│   │   │   ├── stripe/     # checkout + webhook
│   │   │   ├── chatbase/   # JWT token
│   │   │   ├── monitor/    # News monitoring trigger
│   │   │   ├── sentiment/  # Sentiment analysis
│   │   │   └── search/     # Upstash search
│   │   └── globals.css     # Global styles + CSS variables
│   │
│   ├── components/
│   │   ├── media-pulse/    # Dashboard-specific components
│   │   │   ├── DashboardGrid.tsx       # KPI card orchestrator + geographic reach
│   │   │   ├── ArticleTable.tsx        # Coverage log table
│   │   │   ├── ManualEntryModal.tsx    # Manual article form
│   │   │   ├── ArticlesTrendChart.tsx  # Area chart (runtime CSS var resolution)
│   │   │   ├── SentimentDonutChart.tsx # Half-donut NSS gauge
│   │   │   ├── EmotionRadarChart.tsx   # Emotion radar chart
│   │   │   ├── DeepStatusPanel.tsx     # Deep web scan UI
│   │   │   ├── NewsGenerator.tsx       # Monitoring form
│   │   │   ├── OsintTab.tsx            # OSINT engine
│   │   │   └── PressReleasePanel.tsx   # PR wire sync
│   │   ├── ui/             # Reusable primitives (Button, HoverPrefetchLink, etc.)
│   │   └── *.tsx           # Page-level client components
│   │
│   ├── lib/
│   │   ├── gemini.ts               # Gemini API wrapper
│   │   ├── gemini-key-resolver.ts  # BYOK key resolver
│   │   ├── stripe.ts               # Stripe server SDK
│   │   ├── stripe-products.ts      # Product/price ID constants
│   │   ├── rateLimit.ts            # Upstash rate limiter
│   │   ├── upstash.ts              # Upstash client
│   │   └── metrics.ts              # AVE/reach helpers
│   │
│   ├── i18n/
│   │   └── config.ts       # Locale config (ar + en, ar default)
│   │
│   └── utils/              # Shared utility functions
│
├── messages/
│   ├── ar.json             # Arabic translations
│   └── en.json             # English translations
│
├── public/                 # Static assets
├── data/
│   └── osintResources.json # Static OSINT directory data
├── docs/                   # Project documentation (this folder)
└── next.config.mjs         # Next.js configuration
```

---

## 5. Adding a New Page

1. Create `src/app/[locale]/your-page/page.tsx`
2. If it needs auth, it's automatic (only public routes in `isPublicRoute` in middleware escape auth check)
3. Add navigation link in `src/components/Navbar.tsx` and `src/lib/navigation.ts`
4. Add translation keys to **both** `messages/ar.json` AND `messages/en.json`

---

## 6. Adding Translation Keys

**Never add a key to just one language file.** Both files must stay in sync.

```jsonc
// messages/en.json
{
  "MyNamespace": {
    "my_key": "English text"
  }
}

// messages/ar.json
{
  "MyNamespace": {
    "my_key": "النص العربي"
  }
}
```

In the component:
```tsx
const t = useTranslations('MyNamespace');
// ...
{t('my_key')}
```

---

## 7. Adding a Convex Function

```typescript
// convex/myFeature.ts
import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";

// Query (read-only, reactive)
export const getItems = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("table_name")
      .withIndex("by_user_id", q => q.eq("userId", args.userId))
      .collect();
  },
});

// Mutation (write, reactive)
export const createItem = mutation({...});

// Action (can call external APIs, Node.js runtime)
export const fetchExternal = action({...});
```

> **Rule:** Use `action` only when you need external HTTP calls. Use `query`/`mutation` for DB operations.

---

## 8. Stripe Integration

### Adding a new product
1. Create the product in Stripe Dashboard
2. Add product/price IDs to `src/lib/stripe-products.ts`
3. The checkout flow uses `/api/stripe/checkout` POST endpoint
4. Webhook events are handled in `/api/stripe/webhook`
   - Includes full subscription lifecycle (`completed`, `updated`, `deleted`)
   - Dispatch notifications on `invoice.payment_failed` and `checkout.session.async_payment_failed`

### Testing webhooks locally
```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

---

## 9. Gemini Key Priority

The app supports BYOK (Bring Your Own Key):
1. Check `userSettings.geminiApiKey` in Convex (user's own key)
2. Fall back to `app_settings.apiKeys.gemini` (admin-configured key)
3. Fall back to `process.env.GEMINI_API_KEY`

This is handled in `src/lib/gemini-key-resolver.ts`.

---

## 10. Chart Color Resolution

CSS variables in `globals.css` store **raw hex values** (e.g. `--primary: #2563EB`). When you use these inside Recharts or SVG attributes, `hsl(var(--primary))` produces invalid CSS (`hsl(#2563EB)`) and renders as black or transparent.

**The pattern for all chart components:**

```typescript
// Resolve at mount time, not at render time
function getCSSVar(name: string): string {
    if (typeof window === "undefined") return "";
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

useEffect(() => {
    setColors({
        primary: getCSSVar("--primary"),       // hex → use directly
        border:  getCSSVar("--border"),         // hex → use directly
        popover: getCSSVar("--popover"),        // hex → use directly
        // Status tokens are bare HSL components (e.g. "158 64% 52%") → wrap with hsl()
        success: `hsl(${getCSSVar("--status-success")})`,
        warning: `hsl(${getCSSVar("--status-warning")})`,
        error:   `hsl(${getCSSVar("--status-error")})`,
    });
}, []);
```

> **Rule:** Always provide fallback hex values in the initial `useState({})` call so the component renders correctly on the server (no `window`) and before hydration.

---

## 11. Dashboard Button System

`src/app/[locale]/dashboard/page.tsx` does **not** import the `Button` component. All interactive controls are native `<button>` elements with explicit Tailwind classes. This was deliberately chosen to eliminate height/shape inconsistency from the `Button` component's internal sizing system.

**The unified spec for all buttons in this file:**

| Property | Value |
|---|---|
| Height | `h-9` (strict, no `h-auto`) |
| Text | `text-xs font-semibold` |
| Shape | `rounded-lg` |
| Focus | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` |
| Icon size | `w-3.5 h-3.5` |

**Three visual tiers:**
1. **Segmented groups** (view switcher, export buttons) — `overflow-hidden` container, `border border-border`, `bg-muted/50`, separator `<div className="w-px h-5 bg-border" />`
2. **Standalone actions** (Settings icon, Manual Entry) — `rounded-lg border border-border bg-muted/50 shadow-sm`
3. **Destructive action** (Clear All) — `border-status-error-fg/20 bg-status-error-bg text-status-error-fg`

> **Do not re-add the `Button` component import** to this file. If you need a new button, follow the native `<button>` pattern above.

---

## 12. Data Quality & AI

This application implements strict boundaries on automated data ingestion using Gemini to validate relevancy before saving records to the database.

### Relevancy Logic
- **`RELEVANCY_THRESHOLD` is set to 85%.**
- Only articles scoring 85 or higher out of 100 on the relevancy scale are saved.
- This threshold is enforced in `monitoringAction.ts` to dramatically reduce noise, tangential mentions, and false positives in the system. 

### Sentiment Rules (UAE/KSA Precision)
To prevent the application from hallucinating negative sentiment on standard business/regional operations, specific context rules are applied to the Gemini prompt:
- **Standard Legal/Corporate Updates** (e.g., memorandums, standard executive restructuring, compliance milestones) MUST be classified as **Neutral**, not negative or positive.
- Do NOT revert the Gemini prompt to generic emotional scales. The prompt natively understands UAE/KSA business semantics and should only flag material risks or exceptional successes.

---

## 13. Deployment (Vercel)

1. Push to `main` branch on GitHub
2. Vercel auto-deploys via GitHub integration
3. **Before deploying, verify all `NEXT_PUBLIC_*` and secret env vars are set in Vercel project settings** — `.env.local` is never deployed
4. Run Convex deploy separately if schema changed:
   ```bash
   npx convex deploy
   ```

### Production checklist
- [ ] All env vars set in Vercel
- [ ] Convex deployment URL matches `NEXT_PUBLIC_CONVEX_URL`
- [ ] Stripe webhook endpoint registered pointing to `https://yourdomain.com/api/stripe/webhook`
- [ ] Clerk production mode enabled with correct domain
- [ ] Chatbase chatbot configured

---

## 14. Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `MISSING_MESSAGE: Could not resolve X in locale ar` | Key missing from `ar.json` | Add key to `ar.json` (and `en.json` if also missing) |
| `freeOnly is not defined` | Variable used in useMemo but not declared | Add `const [freeOnly, setFreeOnly] = useState(false)` |
| `MIDDLEWARE_INVOCATION_FAILED` | Convex or Node.js API used in middleware | Remove any Convex calls from `src/middleware.ts` |
| `Not authenticated` in Convex action | Missing auth context | Ensure `ctx.auth.getUserIdentity()` is checked, not skipped |
| Duplicate locale in URL `/en/en/` | Middleware applying locale twice | Check `isPublicRoute` matcher isn't double-wrapping intl |
| Chart renders black/transparent | `hsl(var(--token))` in SVG — tokens are hex, not HSL components | Use `getCSSVar()` pattern — see §10 above |
| `ReferenceError: Button is not defined` | `Button` import removed from `dashboard/page.tsx` but usages remain | Convert remaining `<Button>` to native `<button>` — see §11 above |
| Recharts tooltip `payload` type error | `payload` is `readonly any[]` — cannot be spread into typed interface | Inline the render callback or cast with `as { value?: number }` |
| `Session History Item Has Been Marked Skippable` | Programmatic navigation pushing sign-in redirect to history stack | Use `router.replace()` instead of `router.push()` for auth redirects |
