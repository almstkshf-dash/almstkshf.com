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

### Package Overrides & Security Fixes
We utilize the `overrides` field in `package.json` to force modern, secure, and non-deprecated versions of nested sub-dependencies (e.g., `rimraf`, `glob`, `inflight`) pulled in by external dependencies (such as `@tensorflow-models` or `exceljs`). 

Specifically:
- `glob` is forced to `^13.0.0` because the author of `glob` has deprecated all older major versions up to the current modern release line (v13+) to prevent security vulnerabilities and ensure ongoing support.
- `rimraf` is forced to `^5.0.5`.
- `inflight` is forced to use the modern `lru-cache@^10.2.2` package.

This guarantees the prevention of security vulnerability warnings and keeps deep dependencies clean. Run `npm install` normally, and npm will automatically apply these overrides.

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

## 14. Accessibility & WAI-ARIA

Strict accessibility limits are in place across the application to ensure WCAG 2 AA compliance:
- **Dialogs / Modals:** All `Dialog` implementations (like Radix UI) MUST include a `<DialogTitle>` to be accessible for screen readers. If the title should not be visibly displayed, it must still be rendered but wrapped in a `<VisuallyHidden>` component.
- **Color Contrast:** All `status-*` (e.g. `status-success`, `status-warning`) text and background pairings must achieve a compliant contrast ratio. Do not hardcode opaque foregrounds over overly bright backgrounds; utilize alpha fallbacks and opacity combinations that pass AA compliance tests.

---

## 15. Performance Optimizations

- **Input Latency:** Any component relying on high-frequency textual inputs (such as the `NewsGenerator`) or toggle states (`ThemeToggle`) should be optimized using `React.memo` for static sub-components to prevent the whole tree from re-rendering on every keystroke.
- **CSS Transitions:** Avoid applying heavy `all` transitions on interactive wrappers. Target exact properties (`transition-colors`, `transition-opacity`) to avoid layout thrashing and Cumulative Layout Shift (CLS), such as in the site Footer and navigation items.

---

## 16. Export Generation (PDF & Excel)

When generating reports using `jsPDF` or `ExcelJS` that include Arabic content:
- All generated PDF exports MUST properly enforce UTF-8 text encoding and rely on centralized Arabic font loading (Amiri font).
- Use the application's Arabic shaping/RTL reordering utility on dynamic text variables prior to rendering text onto the PDF canvas. Failing to do so will result in text rendering as isolated letters from left-to-right or rendering as mojibake.
- **Dynamic Table Configurations & Column Widths**: Column widths are precisely defined (e.g., image: 10, title: 60, source: 22, etc.) to fit cleanly within standard landscape formats.
- **RTL Mirroring & Column Orders**: When Arabic mode is detected, the table columns (`activeColumns`) are completely reversed to naturally present columns from right to left (RTL).
- **Context-Aware Column Alignments**: Text alignments (`halign`) are dynamically evaluated (e.g., aligning titles and sources to the right in Arabic mode, and keeping numeric data like reach/AVE aligned to the left so that digits flow naturally).
- **Structural Layout Alignment**: Key non-tabular layout components (Executive Summary, Sentiment Distribution Gauges, and AI Strategic Recommendations) dynamically adjust their coordinates and alignments (`align: 'right'` vs. `'left'`) to match the selected layout direction.

---

## 17. Common Errors & Fixes

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

---

## 18. X (Twitter) Dual Ingestion Pipeline

To maximize coverage and guarantee 100% uptime for social media news tracking, the application implements a dual-strategy ingestion engine for X (Twitter) profile feeds:

### Ingestion Modes
- **Primary Mode (Official API v2)**: If an official `X_BEARER_TOKEN` or `BEARER_TOKEN` is detected, the engine queries the official Twitter API endpoints (`users/by/username/${username}` and `users/${id}/tweets`) to retrieve real-time posts.
- **Self-Healing Fallback (Public Syndication)**: If Vercel environment variables are missing, rate-limited, or encounter errors, the crawler automatically falls back to scraping `syndication.twitter.com/srv/timeline-profile/screen-name=${username}` HTML content using `cheerio`. It extracts raw JSON payloads from `#__NEXT_DATA__` safely.

### Source Classification & DB Mapping
- Unlike standard RSS feeds classified as `Press Release` or `Online News`, X (Twitter) sources are automatically mapped as `"Social Media"`.
- This propagates correctly through the database to support precise multi-channel filtering, reach evaluation, and sentiment analysis on the user's dashboard.

### Adding New Twitter Profiles
1. Open [rss-sources.ts](file:///c:/Users/ceo/OneDrive/Desktop/projects/almstkshf.com/almstkshf.com/src/config/rss-sources.ts) and add the profile under the `PREMIUM_SOURCES` configuration with a category key of `'X (Twitter)'`.
2. Open [monitoringAction.ts](file:///c:/Users/ceo/OneDrive/Desktop/projects/almstkshf.com/almstkshf.com/convex/monitoringAction.ts) and append the target profile configuration to the `PR_WIRE_FEEDS` list using the format:
   ```typescript
   { name: "Sky News Arabia (X)", url: "https://syndication.twitter.com/srv/timeline-profile/screen-name=SkyNewsArabia", country: "AE", lang: "ar" }
   ```
3. Update both `messages/en.json` and `messages/ar.json` under `"RssSources"` namespace with safe keys (using underscores instead of dots to prevent key nesting errors).

---

## 19. PDF Image Proxy & Visual Thumbnails

When rendering external images (like news thumbnails) inside standard HTML elements (`img`), the browser usually handles cross-domain policies automatically (or fails gracefully with `onError`). However, generating PDF exports (`generatePressReleasePDF` and `generateMediaMonitoringPDF`) via client-side `jsPDF` requires downloading the raw image blob via `fetch()`, which is strictly blocked by browser CORS security policies.

### Server-Side Proxy Strategy
To bypass CORS blocks natively and enable high-fidelity image rendering within PDF exports:
- Do not call `fetch(imageUrl)` directly on third-party domains.
- Instead, utilize the built-in server proxy endpoint: `fetch('/api/proxy-image?url=' + encodeURIComponent(imageUrl))`.
- The Next.js server route securely resolves the image from the external host, forwarding it back to the client as a clean local payload.
- Convert the resulting blob into a base64 string using `FileReader`.

### Dynamic Format Resolution
Always dynamically resolve the `data:image/` MIME type back to standard uppercase formats (like `PNG` or `JPEG`) before injecting it into jsPDF's `addImage` function. This prevents rendering crashes caused by invalid byte parsing.

---

## 20. Manual Entry URL Validation & Social Media Interceptor

To support adding all kinds of external links (including social media links such as TikTok, Instagram, Facebook, Twitter/X, YouTube, LinkedIn, Pinterest, Snapchat, Reddit, Threads, Telegram, WhatsApp, Twitch, and Radiant, as well as complex Arabic news URLs with trailing spaces or missing protocols), the Manual Entry Modal utilizes an intelligent validation and interceptor pipeline:

### Input Normalization & Sanitization
- **URL Input Type**: The input field uses `type="text"` instead of the native HTML5 `type="url"`. This prevents strict browser-level HTML validation popups from blocking form submission when trailing whitespace or copy-paste artifacts are present.
- **Helper Function `sanitizeUrl`**: Processes raw URL inputs by:
  - Trimming leading and trailing whitespaces.
  - Splitting by space, commas, or newlines, and extracting only the first valid URL if multiple links are pasted together.
  - Automatically prepending `https://` if the input resembles a domain (e.g., contains a `.`) but lacks a protocol.
- **On Blur & On Submit Sanitization**: Sanitizes URLs automatically on input `onBlur`, during background auto-extraction, and prior to saving the article to Convex.

### Social Media Smart Auto-Fill
- **Auto-Detection**: When a social media link is pasted or loses focus (`onBlur`), the `detectSocialMedia` helper checks the domain (e.g., `tiktok.com`, `instagram.com`, `facebook.com`, `x.com`, `youtube.com`, `linkedin.com`, `pinterest.com`, `snapchat.com`, `reddit.com`, `threads.net`, `telegram.org`, `whatsapp.com`, `twitch.tv`, `radiant.social`).
- **Form Auto-Update**: Instantly updates the coverage **Type** selector to `"Social Media"` and populates the **Source Name** with the detected platform (e.g., `"TikTok"`, `"Instagram"`, `"Facebook"`, `"Twitter/X"`, `"YouTube"`, `"LinkedIn"`, `"Pinterest"`, `"Snapchat"`, `"Reddit"`, `"Threads"`, `"Telegram"`, `"WhatsApp"`, `"Twitch"`, `"Radiant"`).

### Extraction Safeguards & Interception
- Standard scraping APIs (like WorldNews API) fail when fetching authentication-gated social media pages.
- The `handleExtract` method intercepts social media links before invoking external extraction hooks.
- It displays a helpful, multi-lingual warning dialog asking the user to manually input the article title/content, while gracefully retaining the sanitized link in the form payload.

---

## 21. TypeScript Type-Checking & Watchlist Strict Safety

To maintain high standards of code stability and a clean compiler profile:
- **Watchlist & Sanitization Schema**: The `TerroristListItem` and its corresponding translations in `ReportTranslations` are strictly declared within `src/types/reports.ts`. Adding new columns/importers must be matched with explicit typings here to avoid falling back on `unknown` types which crash React 19 JSX renderings.
- **Dynamic Models & TFJS Laziness**: In client-side ML processors (like `mlHelper.ts`), tensorflow/biometric models must be typed as `any` due to dynamic environment loading constraints, avoiding `unknown` restrictions on inference methods.
- **Convex Custom Identifiers**: Handlers dealing with DB entities (e.g. notifications dropdowns) should use flexible typings like `any` or explicit `Id<"table">` generics when mapping variables directly to Convex mutation interfaces, resolving strict schema validation errors.

---

## 22. Recharts ResponsiveContainer & Next.js Preloading Optimizations

To maintain a zero-warning console log profile in production and development:

### Recharts "width(-1) and height(-1) of chart should be greater than 0" Resolution
- **Cause**: Recharts' `<ResponsiveContainer>` initializes with `{ width: -1, height: -1 }` before the standard `ResizeObserver` evaluates parent pixel sizes. If child charts (e.g., `AreaChart`, `RadarChart`, `PieChart`) attempt to render before this measurement is complete, Recharts will print dimensions warnings.
- **Solution**: Always configure the `initialDimension` prop on `<ResponsiveContainer>` components to match their layout fallbacks:
  - `ArticlesTrendChart.tsx`: `initialDimension={{ width: 10, height: 160 }}` (matches 160px height).
  - `EmotionRadarChart.tsx` & `SentimentDonutChart.tsx`: `initialDimension={{ width: 10, height: 300 }}` (matches 300px height).
  - `ReportsChart.tsx`: `initialDimension={{ width: 440, height: 220 }}` (matches 2:1 aspect ratio constraint).

### Dynamic Dynamic Preloading Interception
- **Cause**: Standard root layouts (`layout.tsx`) preloading page-specific textures (like `/noise.svg`) will trigger browser "resource was preloaded but not used" console warnings on clean interior subpages (like dashboards, Stripe checkout, etc.).
- **Solution**: Never preload highly localized, section-specific images globally. Instead, call `ReactDOM.preload('/noise.svg', { as: 'image' })` dynamically within the specific component that renders them (e.g. `HeroSection.tsx` for the home page). Keep only global layout requirements (like `/logo.png`) in the root `layout.tsx`.

---

## 23. Next.js API Cron Job (standard-sweep) & RSS Ingestion Engine

To support automated background media sweeps via Vercel Cron, the application implements a background pipeline under `/api/cron/standard-sweep` which fetches registered RSS feeds and updates the database via `/api/monitor`:

### Dynamic Base URL Resolution
- In serverless server environments, `process.env.NEXT_PUBLIC_APP_URL` can be unreliable.
- To prevent `connect ECONNREFUSED 127.0.0.1:3000` failures, the sweep route dynamically resolves its hosting domain using `new URL(request.url).origin` for all internal self-calls to the monitor API.

### Relative Redirect Support in RSS Connection Engine
- Some premium publishers (e.g. *The National*) return relative HTTP redirects (e.g., `/rss/`).
- The manual connection engine inside `rss-engine.ts` resolves these redirects against the target feed's base URL using the standard `new URL(fixedLocation, url).toString()` constructor, ensuring robust connection resolution.

### Graceful Vercel Blob Token Handling
- To prevent missing `BLOB_READ_WRITE_TOKEN` warning spam in development environments or localized builds, `uploadImageToBlob` instantly short-circuits and returns the original image URL if the token is not present. This keeps system logs clean and clutter-free.

---

## 24. Saved Collections UI & Report Library Integration

To bridge the gap between saved search articles (via `SaveToCollectionModal`) and dashboard accessibility, the Central Media Repository (`/media-monitoring/central-media-repository`) incorporates the `ReportLibrary` component inside a premium, glassmorphic segmented tabbed switcher:

### Tabbed Switcher Layout
- **Saved Collections (Active Library)**: Default active tab. Displays `<ReportLibrary />` providing real-time search, category filtering, and direct PDF generation of saved reports using `ReportGenerator`.
- **System Specifications & Overview**: Displays standard Almstkshf enterprise hub features, bulk uploading breakdowns, facial recognition specifications, and premium CTAs.
- Uses smooth dynamic transitions powered by `framer-motion`'s `<AnimatePresence>` for an organic, responsive app experience.

### Arabic Localization & Logical Layout Mirroring
- **CSS Logical Properties**: The search input element in `ReportLibrary.tsx` has been transitioned to fully use CSS logical spacing properties (`left-3` -> `start-3`, `pl-10` -> `ps-10`, `pr-4` -> `pe-4`). This aligns with standard Arabic specification guidelines, ensuring that search icons and text paddings dynamically swap their spatial directions between English (LTR) and Arabic (RTL).
- **Directional Icon Mirroring**: The primary transition chevron / arrow icons (e.g., `ArrowRight` inside capabilities learning actions) are configured with the `.rtl-mirror` class, automatically mirroring directional visual flow for Arabic users.

---

## 25. SimilarWeb API Integration & Domain Reach Estimation

To bring high-fidelity traffic-based reach estimations for digital news media sources (which is standard for social media but not normally available for general online news), the application utilizes a premium SimilarWeb API integration:

### Integration Strategy & Flow
1. **API Key Setup**: Administrators can add their `SIMILARWEB_API_KEY` (configured in the database settings object under `similarweb`) under **System Settings** -> **News** (tab `ai`) or `/dashboard/settings/api-keys`.
2. **Domain Traffic Retrieval**: In `monitoringAction.ts`, when a digital article is parsed, the engine extracts the base domain (e.g. `skynewsarabia.com`).
3. **Smart Caching Layer**: The system queries the `similarweb_domain_traffic` database cache first. If a recent monthly traffic record for the domain is found, it is reused.
4. **SimilarWeb Fetch**: If no cache entry exists, the action initiates an external HTTPS request to `api.similarweb.com/v1/website/${domain}/total-traffic-and-engagement/visits` to retrieve the monthly world visits.
5. **Visits-to-Reach Formula**: The retrieved monthly domain visits are divided by `100` (`Visits / 100`) to compute a realistic "Article Reach", providing instant estimation parity with social media.
6. **Robust Fallback**: If the key is not set, or the limit is hit, or the domain has no recorded traffic, the system falls back to standard default values, keeping sweeps resilient and fully error-free.

---

## 26. White Label & Custom Branding

To enable premium brand styling and reports customization across exported PDF and Excel reports:
- **Database Schema**: Added `brandName`, `brandTagline`, and `footerUrl` optionally to `settings` in `convex/schema.ts`.
- **General Settings**: The settings management page (`/dashboard/settings`) contains a dedicated **White Label & Custom Branding** grid panel allowing standard and professional tier users to save their brand logo, name, tagline, and custom footer domain.
- **Export Integration**: Dynamic branding values are resolved in `src/lib/report-generator.ts` which loads custom logos (with clean fallback to system assets), custom taglines on report cover pages, and custom footer domains on page numbers. All tabs and dashboard elements — including `TerroristListTab.tsx`, `DarkWebTab.tsx`, `DeepStatusPanel.tsx`, `OsintTab.tsx`, `AiInspectorTab.tsx`, and `DashboardGrid.tsx` (the main media monitoring dashboard) — retrieve the custom settings database configuration via `useQuery(api.settings.getSettings)` and pass branding parameters automatically. This guarantees that custom logos and institutional metadata are fully rendered on every exported report.

---

## 27. Next-intl Translation Namespace & Template Formatting Constraints

To ensure zero console and runtime errors when rendering localized components with dynamic variables:
- **Correct Translation Namespace Access**: The export settings configuration (e.g. `exportTranslations`) in components must strictly bind to the modern root namespace `"Export"` instead of deprecated hierarchical sub-namespaces (such as `"MediaMonitoring.dashboard.export_translations"`). Accessing keys through incorrect namespaces will throw `MISSING_MESSAGE` exceptions.
- **Required Variable Injection**: For localized strings that contain parameter placeholders (e.g., `"generated_at": "تاريخ الإصدار: {date}"` or `"page_count": "Page {current} / {total}"`), standard next-intl rendering requires passing the expected template variables. When translating configurations that will be evaluated later at the utility/library level (such as in `ReportGenerator.ts`), you must explicitly forward raw placeholder tags by calling:
  ```typescript
  generated_at: tExport('generated_at', { date: '{date}' }),
  page_count: tExport('page_count', { current: '{current}', total: '{total}' })
  ```
  This avoids immediate `FORMATTING_ERROR` exceptions during translation lookup in parent components while retaining full template variable functionality in the down-stream generator.

---

## 28. Manual Social Entry & Persistent Coverage Editing

To support comprehensive media monitoring campaigns across online, offline, and social media channels:
- **Unified Schema Field**: Added `publisherUsername` (Publisher Account Name) field to the schema and database models.
- **Full Social Coverage Entry**: The manual article entry form supports all platform details including title, content, custom image URLs, source type, country, language, sentiment direction, reach, AVE, and publisher account name.
- **Persistent Media Editing UI**: Implements direct editing inside the Coverage Log table. Users can click the edit icon on any row to open the editing sheet, modify metrics, update metadata (such as the Publisher Account Name), and save changes instantly back to the database via the `updateArticle` Convex mutation.
- **Arabic Translation & Directional Layout**: Supported in both English and Arabic translations for manual entry, editing dialogs, table grids, and exported PDF/Excel sheets. RTL sheets views are automatically enabled for Arabic exports, keeping the dashboard and generated assets professional and fully compliant.

## 29. Windows Local Development & Convex ESM Absolute Path Resolution

When developing locally on Windows, Convex's local backend (ephemeral or dev server) runs sandboxed functions inside a Node.js process using dynamic `import()`. Node's default ESM loader on Windows expects absolute paths to have a valid `file://` scheme, and throws an error if an absolute path starts with a drive letter protocol (`c:`):
`Only URLs with a scheme in: file, data, and node are supported by the default ESM loader. On Windows, absolute paths must be valid file:// URLs. Received protocol 'c:'`

### Solution & Cross-Platform Best Practices
1. **Reduce "use node" Directives**: Only apply `"use node";` to files that absolutely require Node.js core libraries (like `rss-parser`, `cheerio` or `xml2js` when pulling feeds in `monitoringAction.ts`).
2. **Remove Node dependencies from utils & utilities**: Ensure utility helpers (like QStash publishers, database key resolvers, deduplication engines, and query/action triggers) are written using cross-platform standard JavaScript and Web APIs.
   - For example, `searchOptimizer.ts` and `osint.ts` now execute entirely inside standard Convex V8 runtime, making them extremely fast and avoiding any Windows local backend compatibility issues.
3. **Pure JS Cryptographic Hashing**:
   - For **MD5**: Replaced the Node.js core `crypto` dependency inside helper functions with a pure JavaScript MD5 implementation.
   - For **SHA-256**: Replaced `createHash` imports with standard globally-available Web Crypto:
     ```typescript
     const data = new TextEncoder().encode(raw);
     const hashBuffer = await crypto.subtle.digest("SHA-256", data);
     const hashArray = Array.from(new Uint8Array(hashBuffer));
     const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
     ```
This keeps backend code ultra-portable, dramatically improves execution speed, and guarantees that local testing on Windows matches production deployment behavior perfectly.

---

## 30. Monitored Keyword Collections & Press Release sync status

To provide enterprise-grade capabilities for public relations and media agencies, the Press Monitor (PR Wire Monitoring panel) includes a complete, interactive **Monitored Keyword Collections** system:

### Keyword Collections Architecture & Schema
- **Database Schema**: Managed via the `keyword_collections` table, storing `{ name: string, keywords: string[] }` entries.
- **CRUD Operations**: Handlers are defined in `convex/keywordCollections.ts` and exported as queries/mutations:
  - `getKeywordCollections`: Lists all registered collections.
  - `createKeywordCollection`: Creates a new collection with an empty keyword array.
  - `deleteKeywordCollection`: Deletes a collection by its identifier.
  - `addKeyword`: Appends a keyword to a collection's `keywords` array, avoiding duplicates.
  - `deleteKeyword`: Removes a keyword from a collection's `keywords` array.

### Premium UI & Interactive Pills
- **Inline Forms**: Allows administrators to create new collections and add keywords in-place.
- **Interactive Pills**: Renders keyword pills inside the active collection card. Clicking a pill automatically populates the core keyword input field, streamlining search workflows.
- **Glassmorphic Styling**: Adheres to modern design parameters with border animations, glass containers (`bg-muted/30 border-border/80`), and micro-interactions.

### Re-evaluated Search Success Summary & Messaging
- The search status summary replaces static result text with dynamic, localized templates.
- If news articles are successfully synced, it renders `sync_success_with_sources`, listing the specific news outlets (e.g., *Sky News Arabia, Al Arabiya*) that returned new coverage.
- If no news matches are found, it gracefully flags `sync_success_no_articles` or `no_keyword_match`, keeping operations informative, accurate, and completely localized in both Arabic and English.

---

## 31. Convex Collections Schema Resilience & Unauthenticated Query Handling

To resolve runtime server errors during collection fetching and schema synchronization:

### 1. Robust Schema Widening & Narrowing Pattern
- **Problem**: Legacy records created prior to strict schema validation definitions (or documents containing missing timestamp/metadata fields) would cause Convex's internal validator to throw a `ValidationError` on fetching (bubbles up as a generic "Server Error").
- **Solution**: Widened the `collections` table schema in `convex/schema.ts` by making `createdAt` and `updatedAt` optional (`v.optional(v.number())`), and strictly typed the array of `items` while keeping `addedAt` optional (`v.optional(v.number())`). This ensures that legacy records compile and execute perfectly.
- **Backfill Migration**: Implemented a database backfill mutation `debug:backfillCollections` in `convex/debug.ts` to automatically populate missing timestamps with their `_creationTime` fallback and sanitize items.

### 2. Graceful Unauthenticated Query Fallbacks
- **Problem**: Queries such as `collections:getCollections` and `collections:getCollection` were throwing a hard `Error("Unauthenticated")` if called before the client's auth state (Clerk) had fully hydrated or if a guest user visited the page. This triggered severe console errors.
- **Solution**: Updated queries to return graceful empty responses (e.g., `[]` or `null`) when the user's `identity` is unauthenticated:
  ```typescript
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
      return []; // Graceful empty fallback instead of throwing error
  }
  ```
  Mutations and actions still enforce hard authentication checks as they represent state-changing actions.

