# ALMSTKSHF.COM

**A UAE-based intelligent media intelligence platform** — providing media monitoring, sentiment analysis, OSINT investigation, crisis management, and AI-powered reporting for executive-level institutions.

---

## 🚀 Quick Start

```bash
npm install
cp .env.local.example .env.local  # fill in your keys
npm run dev                        # starts Next.js on :3001 + Convex dev
```

Visit: [http://localhost:3001](http://localhost:3001)

---

## 📚 Documentation

All documentation lives in the [`docs/`](./docs/) folder:

| Document | Description |
|---|---|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Full system architecture — stack, routes, DB schema, components, middleware, critical patterns |
| [DEVELOPMENT.md](./docs/DEVELOPMENT.md) | Developer guide — setup, env vars, adding features, chart patterns, button system, deployment, common errors |
| [DEVELOPMENT_SPEED.md](./docs/DEVELOPMENT_SPEED.md) | Quick-reference patterns: Convex hooks, translations, getCSSVar for charts, dashboard button snippets |
| [MIDDLEWARE_AUDIT.md](./docs/MIDDLEWARE_AUDIT.md) | Middleware logic and Edge Runtime constraints |

Root-level audit files:

| Document | Description |
|---|---|
| [DASHBOARD_PRODUCTION_AUDIT.md](./DASHBOARD_PRODUCTION_AUDIT.md) | Known production issues, security gaps, and fix priority order |

---

## 🏗️ Stack

| | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS v4 |
| **Backend** | Convex (serverless DB + functions) |
| **Auth** | Clerk |
| **Payments** | Stripe (subscriptions + one-time) |
| **AI** | Google Gemini Pro |
| **Email** | Resend |
| **Chat** | Chatbase |
| **Cache / Rate Limit** | Upstash Redis |
| **i18n** | next-intl (Arabic + English) |
| **Deployment** | Vercel |

---

## 🌍 Locales

- `ar` — Arabic (RTL, default)
- `en` — English

---

## 🧪 Testing

```bash
npm run cypress:open      # interactive E2E tests
npm run e2e:headless      # headless CI mode
```

---

## 📁 Key Directories

```
convex/       Backend functions and schema
src/app/      Next.js routes
src/components/  UI components  
src/lib/      Utility libraries (Gemini, Stripe, metrics)
messages/     i18n translation files (ar.json + en.json)
docs/         Project documentation
public/       Static assets
data/         Static JSON data (OSINT resources directory)
```

---

## ⚠️ Environment Variables

See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md#2-environment-variables) for the full list of required environment variables.

**Critical:** All variables must be set in both `.env.local` (local) and **Vercel project settings** (production).

---

## 📄 License

See [LICENSE](./LICENSE) for details.
