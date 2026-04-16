# Dark Web Module — Implementation Tracker
almstkshf.com · Coding Agent Guide · Stack: Next.js + Convex + Clerk

Phase 1 — API Setup & Schema
Foundation
## [x] T-01
Register API keys: Ahmia + Diffbot + ZenRows
Create free-tier accounts and store keys in Convex app_settings and Vercel env vars.
Ahmia
No key needed — free public API at ahmia.fi/search/?q=
Diffbot
DIFFBOT_API_KEY → free 10k pages/month at diffbot.com
ZenRows
ZENROWS_API_KEY → free 1k requests/month at zenrows.com
Store in
Vercel env vars (Production) + convex app_settings.apiKeys

## [x] T-02
Extend Convex schema: darkweb_results table
Add new table to convex/schema.ts for storing Dark Web scan results separately from osint_results.
convex/schema.ts
Table
darkweb_results
Fields
query, source_type (ahmia|diffbot|zenrows), url, title, snippet, risk_level, country_origin, discovered_at, user_id
Indexes
by_user_id, by_discovered_at, by_risk_level
Note
Run npx convex dev after schema change to auto-generate types

## [x] T-03
Add resolveApiKey utility
Create convex/utils/keys.ts with 3-tier key resolution: userSettings → app_settings → process.env
convex/utils/keys.ts
Export
async resolveApiKey(ctx, envVarName, settingsField?)
Tier 1
ctx.auth → userSettings.byUserId → field lookup
Tier 2
api.settings.getGlobalSettings → apiKeys[field]
Tier 3
process.env[envVarName] ?? null
Usage
const key = await resolveApiKey(ctx, 'DIFFBOT_API_KEY', 'diffbot')

# Phase 2 — Convex Actions Backend
## [x] T-04
Create convex/darkWeb.ts — Ahmia action
Tor-indexed search via Ahmia public API. Returns .onion URLs with titles and snippets.
convex/darkWeb.ts
Action
export const searchAhmia = action({ args: { query: v.string() } })
Endpoint
https://ahmia.fi/search/?q={query}&output=json (GET)
Headers
User-Agent: Mozilla/5.0 (no key required)
Parse
Extract: title, url, description from JSON array
Risk
Auto-tag risk_level: keywords match (leak/hack/breach → high)
Store
ctx.runMutation(api.darkWebDb.insert, { ...result })
Limit
Max 20 results per query, deduplicate by URL

## [x] T-05
Create convex/darkWeb.ts — Diffbot action
Extract structured content from geo-blocked URLs. Bypasses paywalls and regional restrictions.
convex/darkWeb.ts
Action
export const fetchDiffbot = action({ args: { url: v.string() } })
Endpoint
https://api.diffbot.com/v3/article?url={url}&token={key}
Returns
title, text, date, author, language, siteName, tags
Fallback
If Diffbot fails → retry with ZenRows proxy fetch
Key
resolveApiKey(ctx, 'DIFFBOT_API_KEY', 'diffbot')
Note
Diffbot handles JavaScript rendering internally — no Playwright needed

## [x] T-06
Create convex/darkWeb.ts — ZenRows stealth action
Stealth scraping for JS-heavy or bot-protected sites. Used as fallback when Diffbot fails.
convex/darkWeb.ts
Action
export const stealthFetch = action({ args: { url: v.string(), country?: v.string() } })
Endpoint
https://api.zenrows.com/v1/?apikey={key}&url={url}&js_render=true&premium_proxy=true
Params
js_render=true (headless), premium_proxy=true (residential IP)
Country
Add &proxy_country={country} for geo-targeting (US/UK/TR/IR etc.)
Returns
Raw HTML → parse with regex or cheerio for title + body text
Key
resolveApiKey(ctx, 'ZENROWS_API_KEY', 'zenrows')

## [x] T-07
Create convex/darkWebDb.ts — DB mutations
CRUD operations for darkweb_results table. Mirrors pattern from osintDb.ts.
convex/darkWebDb.ts
Exports
insert, getByUserId, deleteById, getByRiskLevel
Pattern
Copy structure from convex/osintDb.ts and adapt field names
Auth
All mutations check ctx.auth.getUserIdentity() — throw if null
Pagination
getByUserId uses .paginate({ numItems: 50 })

## [x] T-08
Add Gemini risk scoring to darkWeb.ts
After fetching content, pass title+snippet to Gemini for risk classification and summary.
convex/darkWeb.ts
src/lib/gemini-key-resolver.ts
Risk levels
low / medium / high / critical
Prompt
Classify this Dark Web content risk for a media intelligence platform. Return JSON: { risk: string, summary: string, tags: string[] }
Key
Use existing gemini-key-resolver.ts — already has 3-tier logic
Attach
Store risk + summary + tags in darkweb_results row

# Phase 3 — Frontend UI
## [x] T-09
Create DarkWebTab.tsx component
New tab in Dashboard alongside Standard / Deep / OSINT / Press.
src/components/media-pulse/DarkWebTab.tsx
Layout
Search bar + source toggles (Ahmia / Diffbot / ZenRows) + results table
Source toggle
Checkboxes to enable/disable each data source per query
Country select
Dropdown for ZenRows geo-targeting (for Diffbot fallback too)
Results table cols
Risk badge · Title · Source · URL · Discovered At · Actions
Risk badge colors
critical=red, high=orange, medium=amber, low=green
i18n
Add DarkWeb namespace keys to both ar.json AND en.json

## [x] T-10
Add DarkWeb tab to Dashboard page
Wire DarkWebTab into the existing dashboard tab structure.
src/app/[locale]/dashboard/page.tsx
Tab label
Dark Web (EN) / الويب المظلم (AR)
Import
import DarkWebTab from '@/components/media-pulse/DarkWebTab'
Guard
Wrap in subscription check — show upgrade prompt if not subscribed
Position
Add after OSINT tab, before Press tab

## [x] T-11
Add translation keys — DarkWeb namespace
Add all UI strings to both language files simultaneously.
messages/ar.json
messages/en.json
Namespace
DarkWeb
Keys needed
tab_label, search_placeholder, source_ahmia, source_diffbot, source_zenrows, risk_critical, risk_high, risk_medium, risk_low, col_title, col_source, col_risk, col_url, col_date, no_results, searching
Critical rule
ALWAYS add to both files in same commit — never one at a time

## [x] T-12
Build DarkWebReport export (PDF + Excel)
Extend existing report generation to include darkweb_results in exports.
src/components/media-pulse/DarkWebTab.tsx
src/lib/metrics.ts
PDF
Use existing jsPDF pattern from ArticleTable — add risk_level column
Excel
Use existing ExcelJS pattern — add sheet 'Dark Web Results'
Extra fields
source_type, risk_level, country_origin, discovery_method
Redaction
Option to redact raw .onion URLs in exported PDF (replace with [REDACTED])

# Phase 4 — Testing & Deploy
## [x] T-13
Local integration test
Run full stack locally and verify each API source returns results.
Step 1
npm run dev → verify Convex dev syncs new schema + actions
Step 2
Test Ahmia: search for 'data breach 2024' — expect 10–20 results
Step 3
Test Diffbot: fetch a geo-blocked URL — expect structured JSON
Step 4
Test ZenRows: fetch a JS-heavy site — expect rendered HTML
Step 5
Verify darkweb_results table populates in Convex dashboard
Step 6
Test both /ar and /en locale for DarkWeb tab — no MISSING_MESSAGE errors

## [x] T-14
Set env vars in Vercel Production
Add all new API keys to Vercel project settings for Production environment.
DIFFBOT_API_KEY
Vercel → Settings → Environment Variables → Production
ZENROWS_API_KEY
Same — ensure scope is Production not just Preview
Verify
CLERK_SECRET_KEY and NEXT_PUBLIC_CONVEX_URL also set (from middleware fix)

## [x] T-15
Deploy + smoke test production
Push to main, deploy Convex schema, verify Dark Web tab works in production.
Step 1
git push origin main → Vercel auto-deploy
Step 2
npx convex deploy (schema changed — required)
Step 3
Open Vercel logs → filter Edge Functions → confirm no MIDDLEWARE errors
Step 4
Login to production → run one Ahmia search → verify results appear
Step 5
Export PDF report → verify Dark Web sheet included