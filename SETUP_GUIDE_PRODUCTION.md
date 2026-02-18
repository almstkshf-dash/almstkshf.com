# 🚀 Production Setup & Migration Guide

This guide ensures that the **ALMSTKSHF** platform is correctly configured for production environments (Vercel, Convex, Clerk, Stripe).

## 1. Authentication (Clerk)
**Issue**: Using Development keys in production causes strict rate limits and instability.

### Checklist:
- [ ] **Instance Type**: Ensure you have switched to a "Production" instance in the [Clerk Dashboard](https://dashboard.clerk.com).
- [ ] **API Keys**: Use keys starting with `pk_live_` and `sk_live_`.
- [ ] **Environment Variables** (Vercel):
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- [ ] **Middleware Warning**: If you see "CRITICAL SECURITY WARNING" in your logs, you are still using test keys.

## 2. Backend (Convex)
**Requirement**: Dedicated production deployment URL.

### Checklist:
- [ ] **Deployment**: Run `npx convex deploy` to push schema and functions to the production environment.
- [ ] **Environment Variables** (Convex Dashboard):
  - `GEMINI_API_KEY`: Required for Media Monitoring and Analysis.
  - `RESEND_API_KEY`: Required for Contact/Waitlist emails.
  - `STRIPE_SECRET_KEY`: Required for payments.
  - `CONTACT_EMAIL`: Set to your authorized Resend email (e.g., `k.account@almstkshf.com`).

## 3. Payments (Stripe)
**Checklist**:
- [ ] **Restricted Keys**: Use live keys in the Stripe Dashboard.
- [ ] **Webhooks**: Configure the webhook URL in Stripe to point to `https://your-domain.com/en/api/stripe/webhook`.
- [ ] **Secrets**: Ensure `STRIPE_WEBHOOK_SECRET` is set in Vercel.

## 4. Security & CSP
The platform uses a strict Content Security Policy (Middleware).
If you integrate new 3D assets or third-party scripts (e.g., Google Analytics), you **must** update the `CSP_HEADER` in `src/middleware.ts`.

- **Current Allowed**: `self`, `clerk.com`, `stripe.com`, `chatbase.co`, `vercel.live`, `blob:`.

## 5. WebGL & Performance
- The Hero 3D section (`MediaWave.tsx`) is designed with **Context Loss Recovery**. If the GPU pressures out, the scene will attempt to restore itself or stay blank without crashing the main application thread.
- **Next.js 15 Compatibility**: `transpilePackages` in `next.config.mjs` handles `troika-three-text` correctly for production workers.

---
*For technical support, contact the internal engineering team or consult the [Architecture Overview](./docs/ARCHITECTURE.md).*
