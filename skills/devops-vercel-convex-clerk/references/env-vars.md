# Env and secret naming

Use GitHub Environments `preview` and `production` to separate values. Keep public keys as environment variables; keep private keys as secrets.

## GitHub secrets (repo or env-specific)
- `VERCEL_TOKEN` (project-scoped, Deployments + Env read)
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `CONVEX_DEPLOY_KEY_PREVIEW`, `CONVEX_DEPLOY_KEY_PRODUCTION`
- `CLERK_SECRET_KEY` (if different per env, suffix `_PREVIEW` and `_PRODUCTION`)
- `SENTRY_DSN` (optional)

## GitHub environment variables (per env)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_CONVEX_URL` (from first Convex deploy per env)
- `NEXT_PUBLIC_SITE_URL` (e.g., preview domain vs prod domain)
- `NEXT_PUBLIC_ENABLE_ANALYTICS` (feature flag example)

## Vercel project envs
- Mirror the same names as above for Vercel runtime (`NEXT_PUBLIC_*` and server-side keys). Vercel automatically exposes vars with `NEXT_PUBLIC_` to the client.
- Keep server-side secrets (`CLERK_SECRET_KEY`, `CONVEX_DEPLOY_KEY_*`) as Vercel `Encrypted` envs if running serverless/edge functions that need them.

## Clerk settings
- Allowed origins: include both the Vercel preview domain (`*.vercel.app`) and the custom production domain.
- Keys: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` for client; `CLERK_SECRET_KEY` for server. Do not bundle secret in the client.

## Convex settings
- Deploy keys are environment-scoped. Use separate keys for preview and production.
- After first deploy, set `NEXT_PUBLIC_CONVEX_URL` to the deployment URL (found via `npx convex deployments list`).
