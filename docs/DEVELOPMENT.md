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
│   │   │   ├── ArticleTable.tsx
│   │   │   ├── DashboardGrid.tsx
│   │   │   ├── DeepStatusPanel.tsx
│   │   │   ├── ManualEntryModal.tsx
│   │   │   ├── NewsGenerator.tsx
│   │   │   ├── OsintTab.tsx
│   │   │   └── PressReleasePanel.tsx
│   │   ├── ui/             # Reusable primitives (Button, etc.)
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

## 10. Deployment (Vercel)

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

## 11. Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `MISSING_MESSAGE: Could not resolve X in locale ar` | Key missing from `ar.json` | Add key to `ar.json` (and `en.json` if also missing) |
| `freeOnly is not defined` | Variable used in useMemo but not declared | Add `const [freeOnly, setFreeOnly] = useState(false)` |
| `MIDDLEWARE_INVOCATION_FAILED` | Convex or Node.js API used in middleware | Remove any Convex calls from `src/middleware.ts` |
| `Not authenticated` in Convex action | Missing auth context | Ensure `ctx.auth.getUserIdentity()` is checked, not skipped |
| Duplicate locale in URL `/en/en/` | Middleware applying locale twice | Check `isPublicRoute` matcher isn't double-wrapping intl |
