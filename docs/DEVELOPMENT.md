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

> 🔒 **Security Warning:** Never write or commit scripts/utilities (such as `fix_env.js` or `verify_keys.js`) that programmatically update or verify environment variables or credentials using hardcoded tokens or API keys. Plaintext secrets in the repository represent a critical security vulnerability. All environment configurations must be managed out-of-band through:
> 1. Local `.env.local` files (which are git-ignored).
> 2. The **Vercel Dashboard** or **Convex Dashboard** settings panel.
> 3. Standard interactive Vercel/Convex CLI commands while logged in securely.

> 🧼 **Workspace Hygiene & Scripting Policy:**
> - **No Temporary Scripts:** Do not write or commit temporary, one-off test, fix, or repair scripts (such as `fix_mojibake.js`, `fix_all_mojibake.js`, or `scratch/fix_encoding.js`) to the repository.
> - **Clean Folders:** Keep the root directory, `scripts/`, and `scratch/` folders clean of test logs (`tsc_output.txt`, `eslint_report.json`), run outputs, and debug templates.
> - **Standardized Utilities Only:** Only permanent, generic utility scripts (such as `scripts/download-font-data.js`) should be retained. All other one-off investigations should be run locally and excluded from git commits.

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
- **Link Prefetching Debouncing:** Always use `HoverPrefetchLink` instead of raw next-intl or Next.js `Link` for prefetching routes. It introduces an `80ms` debounce delay and aborts on cursor exit, preventing excessive network prefetch spam when sweeping the cursor. It also supports focus-based and touch-based prefetching for mobile/keyboard users.
- **Dynamic Image Sizing & Remounting:** Always use `OptimizedImage` for media uploads and article previews. It blocks Cumulative Layout Shift (CLS) by locking parent dimensions when `fill` is not enabled, resets loading/error states immediately when `src` changes via keying, and utilizes localized bilingual fallbacks (with the Lucide `ImageOff` icon) instead of plain hardcoded placeholders.

---

## 16. Export Generation (PDF & Excel)

When generating reports using `jsPDF` or `ExcelJS` that include Arabic content:
- **Offline Amiri Font Bundling**: All generated PDF exports rely on a local base64-encoded Amiri font module (`src/lib/fonts/amiri-font-base64.ts`) loaded directly via `doc.addFileToVFS` and `doc.addFont`. This ensures 100% offline reliability and removes gstatic network dependency.
- **Arabic Glyph Shaping & Character Reversal**: Before passing text to jsPDF, the text is processed using `arabic-persian-reshaper` to shape disconnected Arabic characters into proper connected ligatures. Then, Arabic words are reversed at the character level while maintaining the LTR flow of English text and digits, and the overall sentence word order is reversed to support RTL text flow (see `src/utils/arabic-utils.ts`).
- **Dynamic Bidi Coordinate Alignment**: Manual text rendering (`doc.text()`) dynamically adjusts coordinate origins. When Arabic/RTL is detected, the start coordinate `x` is mirrored (`pageWidth - x`) and aligned to the right (`{ align: 'right' }`).
- **Table Cell Auto-Wrapping & Alignment**: Columns in `jspdf-autotable` are configured with `overflow: 'linebreak'` to prevent content overflow. Cells are parsed using `didParseCell` to check for both normal and shaped Arabic characters, dynamically setting `halign: 'right'` for Arabic/RTL text.
- **Interactive Chart Capture**: Browser-rendered charts (`ReportsChart`, `EmotionRadarChart`, `SentimentDonutChart`, `ArticlesTrendChart`) are captured as PNG data URLs using `html2canvas` and dynamically embedded into the executive summary or visualizations pages of the PDF.
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
| `GET /__clerk/v1/... 400` | Clerk internal handshake/proxy routes being intercepted by `auth.protect()` or localized by `next-intl` | Skip paths starting with `/__clerk` at the very beginning of the `clerkMiddleware` callback |
| `Encountered two children with the same key` | Non-unique mapped array element keys (e.g., duplicated feed names or GUIDs) | Append the map loop index to the element key (e.g., `key={\`${f.name || f.feed}-${index}\`}`) |
| `Error: Clerk was not loaded with Ui components` | Setting `prefetchUI={false}` on `<ClerkProvider>` but rendering standard Clerk UI components (e.g., `<UserButton />`) | Remove `prefetchUI={false}` or set to `true` (default) on `<ClerkProvider>` in `RootProviders.tsx` |
| `You don't have access to the selected project` (Convex) | `npm run dev` running concurrently before the local repository is linked to your authenticated Convex account/team | Run `npx convex dev --configure` interactively in a separate terminal once to link the project to your Convex account/team, then run `npm run dev` |
| `useSearchParams() should be wrapped in a suspense boundary` | Client component using `useSearchParams()` loaded in a static page/layout without a parent `<Suspense>` boundary | Wrap the component (e.g. `<Navbar />`) in a `<Suspense>` boundary inside the parent Server Component or Layout. |
| `Warning: Next.js inferred your workspace root, but it may not be correct` | Accidental `package-lock.json` or `package.json` in parent directories (like `C:\Users\ceo`) | Delete the accidental lockfiles/package files from the user directory to restore correct workspace resolution. |
| `CRITICAL: STRIPE_SECRET_KEY is missing` | Module-level initialization of Stripe server SDK throws error at import time during Next.js build | Use a default mock key fallback during build phase (`process.env.STRIPE_SECRET_KEY || 'sk_test...'`) and handle missing keys dynamically at request time. |
| `Type 'string' is not assignable to type 'never' for className` on dynamic components | Typing Lucide icon props or other dynamic components with general types like `React.ComponentType<any>` or `React.ElementType` in React 19 | Specify the exact prop types expected by the component, e.g. `React.ComponentType<{ className?: string }>`, to allow custom properties. |
| `Type 'string' is not assignable to type 'never'` in Stripe Webhook route for `sendSubscriptionEmail` arguments | TypeScript compiler or IDE server discrepancy with Convex generated action arguments | Cast the action reference and its arguments payload dynamically as `any` in `stripe/webhook/route.ts`. |
| Stripe Webhook fails to send subscription email at runtime | `customer_email` or `email` fields do not exist on the Stripe subscription object | Retrieve the customer object dynamically using `stripe.customers.retrieve(subscription.customer as string)` to get their email address. |


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
- **Safe Dynamic ML Methods checking**: In `mlHelper.ts`, when invoking methods (like `estimateFaces`, `estimateHands`) on dynamically loaded TFJS models, we check if the models exist and the methods are valid functions (`typeof model.method === 'function'`) to prevent runtime errors on empty/uninitialized objects `{}`.
- **MediaPipe Stub Dynamic Resolution**: Build-time stubs in `src/lib/engines/stubs/` satisfy Turbopack compilation constraints (which aliased `@mediapipe/face_mesh` and `@mediapipe/hands`). At runtime in the browser, `mlHelper.ts` dynamically loads the real MediaPipe libraries from jsDelivr CDN and updates the stub's live bindings using `updateGlobals()`, proxying access to the real classes and constants.
- **Union Type Safety in AI Audits**: When displaying scores and metrics in `AiInspectorTab.tsx`, we avoid accessing properties directly on the union type of `TextAnalysisResult | ImageAnalysisReport | VideoAnalysisResult`. We instead query specific properties based on the active mode (e.g., `.score` for text, `.confidenceScore` for image, and `.overallScore` for video) in a type-safe manner.
- **Video Results drawing function**: The callback passed to `.map` on `report.pixelLogicSignals` in `VideoResults.tsx` must be explicitly typed with the exact properties matching `ImageAnalysisReport["pixelLogicSignals"]` array elements, resolving parameter incompatibility errors where `detectedValue` or `threshold` can be either `string` or `number`.
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

---

## 32. Central Media Repository details modal & reports library views

To bridge the final gap in saved media monitoring collection management and provide users with comprehensive tools to review their collections, we have implemented an interactive, RTL-compliant, and fully localized Details Modal:

### Details Modal Architecture & Flow
- **Component File**: Added [CollectionDetailsModal.tsx](file:///c:/Users/ceo/OneDrive/Desktop/projects/almstkshf.com/almstkshf.com/src/components/ui/CollectionDetailsModal.tsx) under the UI components folder.
- **Integration**: Mapped the previously non-responsive "View Details" button in [ReportLibrary.tsx](file:///c:/Users/ceo/OneDrive/Desktop/projects/almstkshf.com/almstkshf.com/src/components/ReportLibrary.tsx) to trigger the modal reactively:
  ```typescript
  onClick={() => setSelectedCollectionId(collection._id)}
  ```
- **Real-time Reactive Fetching**: Inside the modal, the collection is retrieved reactively by its unique identifier using `useQuery(api.collections.getCollection, { id: collectionId })`.

### Key Capabilities & Premium Features
1. **Interactive Search**: Users can filter items inside the collection in real-time by title or content snippet.
2. **Individual Item Management**: A small trash icon next to each item triggers the `removeFromCollection` Convex mutation, with visual loading states for each action.
3. **Entire Collection Deletion**: Supports deleting the entire collection directly from the details panel using `deleteCollection` Convex mutation, with a double-click safety confirmation step to prevent accidental loss.
4. **Full PDF Exporting**: Integrates the same robust multi-lingual PDF export logic (`ReportGenerator`) as the main collections table, resolving settings metadata (such as brand names, taglines, and footers) seamlessly.
5. **Arabic Localization & RTL Compliance**:
   - Spacing is defined entirely via CSS logical properties (`ps-10`, `pe-4`, `start-3`), matching strict Arabic specification parameters.
   - Text alignments, tag labels, source sites, and sentiments mirror dynamically according to the active translation language direction.

---

## 33. Media Ingestion Sources and System Criteria Compliance

To guarantee high success rates, preserve parser stability, and keep background errors at zero, the application enforces strict system criteria on media sources registered in the frontend config (`PREMIUM_SOURCES` in `src/config/rss-sources.ts`) and backend scanner (`PR_WIRE_FEEDS` in `convex/monitoringAction.ts`).

### 1. Ingestion Requirements & System Criteria
For a source to be successfully registered and wired into the system, it MUST:
- Provide a standard, fetchable XML RSS feed structure.
- Successfully parse via the core backend parsing library `rss-parser`.
- Return a `200 OK` HTTP status code on background fetches.
- NOT be protected behind Cloudflare or generic bot detection mechanisms that return `403 Forbidden` on automated crawls.
- NOT return HTML pages, directory lists, or empty XML frameworks.

### 2. Active Compliant Feeds
The following 8 feeds fully comply with all requirements and are active in both frontend and backend configurations:
- **24.ae**: `https://24.ae/rss.aspx` (Country: UAE, Language: Arabic)
- **UAE Barq**: `https://www.uaebarq.ae/ar/feed/` (Country: UAE, Language: Arabic)
- **Pan Time Arabia**: `https://pantimearabia.com/rss/` (Country: UAE, Language: Arabic)
- **Nabd El Emirate**: `https://nbdelemirate.com/feed/` (Country: UAE, Language: Arabic)
- **Gulf Time**: `https://gulftime.online/feed/` (Country: UAE, Language: Arabic)
- **New Vora Group**: `https://newvoragroup.com/feed/` (Country: UAE, Language: Arabic)
- **Ain Al Emirate**: `https://www.ainalemirate.com/feed/` (Country: UAE, Language: Arabic)
- **Mena Scoop**: `https://menascoop.com/feed/` (Country: UAE, Language: Arabic)

### 3. Excluded Feeds (Non-Compliant)
The following requested feeds failed validation audits and are explicitly excluded from integration to prevent system alerts and background failures:
- **WAM (UAE)** (both English and Arabic RSS feeds): Violates standard HTTP/1.1 protocol response formatting (missing carriage returns after header values), causing low-level Node.js protocol parsing/fetching exceptions.
- **Emarat Al Youm** (`https://www.emaratalyoum.com/rss-7.951867`): Returns text/html web layout instead of standard XML RSS.
- **Monte Carlo Doualiya (MCD)** (`https://www.mc-doualiya.com/%D8%AE%D8%AF%D9%85%D8%A9-RSS`): Returns HTML podcast lists, no standard XML feed.
- **ADNOC Press Releases** (`https://adnoc.ae/ar/news-and-media/press-releases`): Returns raw HTML pages.
- **The News Mirror** (`https://thenewsmirror.in/`): Standard `/feed/` path returns 404.
- **Ya Watan** (`https://www.ya-watan.com/`): Strictly blocked by Cloudflare (returns `403 Forbidden` on crawls).
- **PR Newswire** & **AETOSWire**: Strictly protected behind Cloudflare bot protections or user-agent verification walls, resulting in persistent `403 Forbidden` blocks when accessed via cloud serverless functions.
- **Gulf News**, **Khaleej Times**, **Zawya**, **The National**, **Sky News Arabia** (RSS feed), **Gulf Today**, **Vice News**, **Newsweek**, **Politico**, and **UAE Interact**: These feeds suffer from persistent timeouts, DNS resolution blocks, SSL connection handshake failures in Vercel/Convex serverless environments, or empty XML structures. Removing them guarantees zero background scanner errors and keeps execution speeds within safe limits.

---

## 34. Decoupling Live RSS Feed from Keyword-specific Search Results

To ensure that the background Live RSS Feed sweep and general syncs are completely stable and separated features from keyword-specific media monitoring search results:
- **Dedicated RSS Schema**: Added the `rss_feed_articles` table to `convex/schema.ts` to persistently store raw, unfiltered RSS feed items fetched during background sweeps.
- **Backend Separation**: Updated the `fetchPressReleaseSources` action in `convex/monitoringAction.ts` to direct background sweeps (when no keyword is supplied) to save directly to `rss_feed_articles` table via `saveRssArticle` mutation, while keyword-specific searches continue to run AI-powered processing and persist to `media_monitoring_articles`.
- **Sync Specific RSS Feeds**: Refactored `syncSpecificRssFeed` to save synced items into `rss_feed_articles`, separating general syncs from media monitoring keyword streams.
- **Frontend Decoupled Lookup**: Re-routed `articlesQuery` in `RssFeeder.tsx` to retrieve items from `getRssArticles` (which queries the dedicated `rss_feed_articles` table), preventing general live feeds from being affected or cleared when keyword search results are deleted.

---

## 35. Standard View Dashboard Panel Order

To offer an optimized and user-friendly experience on standard-tier screen layouts, the standard view panel configuration within `src/app/[locale]/dashboard/page.tsx` is structured vertically in the exact following chronological sequence:

1. **Standard Discovery (اكتشاف قياسي)**: Real-time search engine query form for scanning news.
2. **Press Release Monitor (رصد البيانات الصحفية)**: Sync and list news articles from targeted PR wires.
3. **Media Coverage Log (سجل التغطية الإعلامية)**: Interactive list of active coverage reports and custom items.
4. **Media Pulse Analytics (التحليلات الإعلامية)**: Core graphical data visualizer, Geographic Reach Map, and KPIs.
5. **Live News Feed (التغذية الإخبارية الحية)**: persistent, automated RSS stream.

---

## 36. Client-Side Errors & Stability Fixes

To guarantee absolute visual stability and console clean-room state for testing, the system implements the following resolutions:

### 1. Link Preload Warning ("preloaded but not used")
- **Root Cause**: Next.js experimental `optimizeCss` (critters) automatically converts standard stylesheets into `<link rel="preload" as="style" onload="this.rel='stylesheet'">`. In modern browsers (Chrome/Edge 110+), this triggers console clutter/warnings if the stylesheet load occurs outside the browser's expected window, or if the `onload` inline event handler is blocked by the Content Security Policy.
- **Resolution**: Disabled `optimizeCss: true` inside `next.config.mjs` (set to `false`). Next.js's native CSS parsing handles styles perfectly and cleanly without any console warnings or performance drops.

### 2. Chatbase verify-token 400 Bad Request
- **Root Cause**: The application previously generated guest JWT session tokens for all anonymous visitors and called `window.chatbase('identify', { token })`. Chatbase returned `400 Bad Request` on `/api/auth/verify-token` because identity verification is restricted to real, authenticated users or has mismatching secrets.
- **Resolution**: Refactored `src/app/api/chatbase/token/route.ts` to check Clerk session authentication. If the visitor is a guest, it returns `{ token: null, is_guest: true }`. In the frontend (`src/components/ChatbaseWidget.tsx`), the `identify` call is conditionally executed ONLY if a valid, non-null token is returned. This eliminates all console 400 errors for anonymous/guest sessions.

### 3. Content Security Policy upgrade-insecure-requests Warning
- **Status**: The console warning `The Content Security Policy directive 'upgrade-insecure-requests' is ignored when delivered in a report-only policy.` originates from the third-party Chatbase iframe servers (`https://www.chatbase.co/...`) delivering a misconfigured `Content-Security-Policy-Report-Only` header. This is external to the codebase, completely non-blocking, and has zero impact on application behavior.

---

## 37. Premium Playwright Scraper Service & Proxy Integrations (Bright Data & Oxylabs)

To ensure a reliable, 100% success rate when scraping dynamic news targets in the Gulf/Arab world that utilize strict anti-bot mechanisms (like Cloudflare or Akamai), the platform incorporates a dedicated **Custom Playwright Scraper Service** combined with high-reputation **Residential Proxies** (supporting both **Bright Data** and **Oxylabs**).

### 1. Scraper Service Architecture
- The scraper runs as an independent Express.js microservice located in the `/scraper-service` folder.
- During local development, running `npm run dev` concurrently boots the Next.js frontend, Convex backend, and this Scraper Service on port `3002`.
- When Next.js or Convex attempts to resolve a URL, it first tries a lightweight direct standard HTTP fetch (speed-optimized). If that fails (status != 200, 403 Forbidden, 404, or network timeout), the resolver automatically falls back to invoking the Playwright microservice.

### 2. Dual Proxy Configuration (Bright Data & Oxylabs)
The service features a robust, dual-strategy proxy configuration which automatically selects the best available residential proxy:

- **Primary Strategy (Bright Data Residential Proxy)**:
  - If `BRD_PROXY_USERNAME` and `BRD_PROXY_PASSWORD` are configured in `.env`, the scraper routes requests via Bright Data (`brd.superproxy.io:33335`).
  - Utilizes dynamic IP session-rotation (`${username}-session-${random}`) and regional geo-targeting (`${username}-country-${country}`).
  - Built-in `ignoreHTTPSErrors: true` ensures that proxy-level SSL/TLS interception doesn't trigger security crashes in Playwright.

- **Secondary Strategy (Oxylabs Residential Proxy)**:
  - If Bright Data credentials are missing but `OXY_PROXY_USERNAME` and `OXY_PROXY_PASSWORD` are defined, it automatically routes through Oxylabs (`pr.oxylabs.io:7777`).
  - Implements Oxylabs session rotation (`${username}-session-${random}`) and country-specific targets (`${username}-cc-${country}`).

### 3. Usage & Fallback Integration
The scraper fallback is fully integrated into the platform's link resolver (`src/utils/linkResolver.ts`) and is consumed by all backend ingestion routes seamlessly:
```typescript
const resolved = await resolveUrl(url, countryCode);
```

---

## 38. Unified Text Encoding & Mojibake Recovery Middleware

To prevent Arabic text deformation (Mojibake) when fetching feeds or scraping articles, the platform employs a centralized, automated encoding and recovery pipeline:

### 1. Scraper Base64 Ingestion
- The Playwright scraper service (`scraper-service/server.js`) returns the raw response body as a Base64-encoded string (`rawContentBase64`) alongside the original `content-type` header.
- This allows consumers (both the Next.js app and the Convex backend) to decode the binary data directly rather than relying on automatic string parsing (which is prone to encoding distortion).

### 2. Centralized Decoding Middleware (`decodeHtmlBuffer`)
- Fetched XML/HTML buffers are decoded using the helper `decodeHtmlBuffer` (located in both `src/utils/encoding.ts` and `convex/utils/encoding.ts`).
- It extracts the charset from:
  1. The `Content-Type` header (e.g. `charset=windows-1256`).
  2. Inline XML encoding declarations (e.g. `<?xml version="1.0" encoding="windows-1256"?>`).
  3. HTML meta tags (e.g. `<meta charset="windows-1256">`).
- If no charset is specified, it runs a fast UTF-8 validation check (`isValidUtf8`). If valid, it decodes as `utf-8`; otherwise, it defaults to `windows-1256` (common for Arabic news).

### 3. Self-Healing Mojibake Recovery
- If the decoded text contains known mojibake signatures (e.g., UTF-8 Arabic text mistakenly decoded as Windows-1252/Latin1, yielding characters like `Ø` or `Ù` followed by control/Latin symbols), `tryRecoverMojibake` is invoked.
- It reverse-maps the character codes to recover the original raw bytes, then decodes them as proper UTF-8, restoring the original Arabic text.

---

## 39. Visual Skeleton Loading States and Layout Stability (CLS)

To deliver a premium visual experience and eliminate Layout Shifting (CLS) and flashing empty states when fetching updates from Convex, the application implements highly matching skeleton loading loaders.

### 1. Table Columns & Padding Alignment
- **ArticleTable.tsx**: Features an `ArticleRowSkeleton` containing the exact column structure (13 columns) and css classes (such as `p-4`, `whitespace-nowrap`, `max-w-sm`, and text alignments) as the live `ArticleRow`.
- When loading (`isLoading === true` or `articles === undefined`), the table remains rendered, and the body displays 5 skeleton rows. This avoids showing the "No Results" dialog prematurely during network roundtrips.

### 2. Dashboard KPIs & Chart Skeletons
- **DashboardGrid.tsx**: Accepts an `isLoading` prop.
- When active, stats cards display pulsing placeholders (`<Skeleton />` from `src/components/ui/Skeleton.tsx`) instead of displaying `0` or jumping between uninitialized numbers.
- Dynamic charts (Sentiment Donut, Emotions Radar, and Articles Trend) are loaded via `<ChartSkeleton />` with explicit heights (e.g., `300px` and `200px`) to prevent page height changes once Recharts resolves.
- Lists like Geographic Reach and Risk Factors display matching row skeletons.
---

## 40. MultiSelectDropdown Inline Search Filter

To streamline user selection in long lists (e.g., countries, source types, or categories), the `MultiSelectDropdown` component implements a dynamic **Inline Text Filter**:
- **Inline Filter Input**: The trigger button contains an embedded text `<input type="text" />` positioned right after the selected tag list.
- **Auto-Focus and Dropdown Synchronization**: Clicking anywhere on the dropdown trigger focuses the inline input field and displays the filtered list of options instantly.
- **Search Query Lifespan**: The search state is automatically reset when the dropdown panel closes, ensuring the full list is visible upon reopening.
- **Keyboard Shortcuts & UX Patterns**:
  - Pressing `Backspace` when the input is empty removes the last selected item tag.
  - Pressing `Escape` closes the dropdown and resets focus.
- **Compact Popover**: The redundant separate search container inside the dropdown popover has been removed, improving vertical density.

