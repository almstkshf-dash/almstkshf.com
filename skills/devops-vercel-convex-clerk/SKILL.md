---
name: devops-vercel-convex-clerk
description: CI/CD and deployment for Next.js/Convex apps hosted on Vercel with GitHub Actions and Clerk auth. Use when setting up pipelines, syncing env/secrets, running preview vs production deploys, and troubleshooting runtime issues across these tools.
---
# DevOps: GitHub + Vercel + Convex + Clerk

## Quick start
- Connect repo to Vercel (one project per env or shared with Git branches). Record `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, and create a `VERCEL_TOKEN` with deploy scope.
- Provision Convex project; grab `CONVEX_DEPLOY_KEY` values for preview/prod and the corresponding `CONVEX_SITE_URL` (after first deploy).
- Create Clerk instance; note `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`; add allowed origins for preview/prod domains.
- In GitHub, create secrets/environment variables named per `references/env-vars.md` for reuse across workflows.
- Add the CI workflow template from `references/ci-workflows.md` (copy to `.github/workflows/vercel-convex.yml`) and update environment names/branches.

## Using the workflow template
- Workflow does install/lint/test/build once, then uses Vercel’s prebuilt flow (`vercel pull` → `vercel build` → `vercel deploy --prebuilt`).
- Convex deploy runs after a successful build: `npx convex deploy --yes` with the env-specific `CONVEX_DEPLOY_KEY`.
- Preview env: triggered on pull requests; production env: on `main` or tagged releases. Adjust branch filters as needed.
- Keep Vercel env vars in sync: either let Vercel pull from GitHub envs (via `vercel env pull` step) or manage directly in the Vercel dashboard.

## Environment and secrets (high-level)
- GitHub secrets (repo or env-level): `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `CLERK_SECRET_KEY`, `CONVEX_DEPLOY_KEY` (per env), optional `SENTRY_DSN`.
- GitHub environment vars (per env): `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CONVEX_URL`, domain URLs, feature flags.
- Keep public keys (`NEXT_PUBLIC_*`) in the environment, not secrets; private keys in secrets.
- See `references/env-vars.md` for exact naming patterns and per-environment guidance.

## Deploy and promote
- Preview: runs on PR; deploys to Vercel preview domain and Convex preview deployment. Share URL for QA.
- Production: triggered on `main`/tag; uses production tokens and pushes to live Vercel + Convex.
- Rollback: use `vercel ls` + `vercel rollback <deploy-id>` for frontend; use `npx convex deploy --to <deployment-name>` for backend rollback to a previous deployment.

## Troubleshooting fast
- Build issues: re-run locally with `npx vercel build` to mirror CI; ensure `vercel pull` ran to hydrate env vars.
- Auth issues: confirm Clerk allowed origins match the Vercel domain and preview URLs; check that publishable/secret keys align with env.
- Convex errors: tail logs via `npx convex tail`; re-deploy with correct `--deploy-key` if an env mismatch occurs.
- 500s after deploy: compare build assets by inspecting the Vercel deployment; if backend only, redeploy Convex without touching frontend.

## Security and housekeeping
- Never commit `.vercel` or `.env*` files. Use GitHub envs/secrets and Vercel project envs instead.
- Scope `VERCEL_TOKEN` to the project; rotate tokens and Convex deploy keys if leaked.
- Keep the workflow cache keys tied to `package-lock.json` to avoid stale deps.
