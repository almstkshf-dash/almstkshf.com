# 🚀 Production Setup & Migration Guide

This guide ensures that the **ALMSTKSHF** platform is correctly configured for production environments (Vercel, Convex, Clerk, Stripe).

### 1. Environment Variable Standardization
Ensure the following variables are set correctly in their respective dashboards.

#### Vercel Dashboard (Project Settings > Environment Variables)
| Variable | Value | Notes |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_Y2xlcmsuYWxtc3Rrc2hmLmNvbSQ` | Clerk Production Key |
| `CLERK_SECRET_KEY` | `sk_live_MB3vomMXSXgJV2ynPA40D9v1A5JusPloH8zbjR9xq5` | Clerk Production Secret |
| `CONVEX_DEPLOY_KEY` | `prod:flexible-anaconda-162|...` | Provided by `npx convex deploy-key` |
| `NEXT_PUBLIC_CONVEX_URL` | `https://flexible-anaconda-162.convex.cloud` | Your Production Convex URL |

#### Convex Dashboard (Settings > Environment Variables)
| Variable | Value | Notes |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `AIzaSyByJa5app8Wlrd...` | Gemini API Access |
| `RESEND_API_KEY` | `re_iUQ9ahfx_8VBdJny...` | For Emailing Reports/Waitlist |
| `CONTACT_EMAIL` | `k.account@almstkshf.com` | Destination for leads |
| `CLERK_FRONTEND_API_URL` | `https://integral-bulldog-65.clerk.accounts.dev` | Clerk OIDC Sync |

### 2. Authentication (Clerk + Convex)
1. In Convex Dashboard, go to **Settings** > **Auth**.
2. Add a new **OIDC Provider**:
   - **Issuer URL**: `https://integral-bulldog-65.clerk.accounts.dev`
   - **Application ID**: `convex`
3. Ensure **Domain** in Clerk is verified: `clerk.almstkshf.com`.

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
