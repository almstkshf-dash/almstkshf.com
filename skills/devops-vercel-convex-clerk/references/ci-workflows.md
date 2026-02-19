# GitHub Actions templates (Vercel + Convex + Clerk)

Copy to `.github/workflows/vercel-convex.yml` and adjust branch names/env vars as needed. Uses Node 18; add `NODE_VERSION` env to change.

```yaml
name: CI and Deploy (Vercel + Convex)

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
  workflow_dispatch:

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    environment: preview
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm run test --if-present
      - run: npm run build
      - run: npx vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
      - run: npx vercel build --token=${{ secrets.VERCEL_TOKEN }}
      - run: npx vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy Convex (preview)
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY_PREVIEW }}
        run: npx convex deploy --yes

  production:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm run test --if-present
      - run: npm run build
      - run: npx vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      - run: npx vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      - run: npx vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy Convex (production)
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY_PRODUCTION }}
        run: npx convex deploy --yes
```

Notes
- `vercel pull` hydrates `.vercel` and `.env` for the target env.
- Use GitHub Environments (preview, production) to scope secrets/vars and add reviewers for production deploys.
- If you prefer a single job with matrix (preview/prod), set `environment` and secret names via matrix vars.
- Add `NEXT_PUBLIC_*` vars via GitHub Environment variables; they get injected into the build during `npm run build` and Vercel build.
- For monorepos, set `working-directory` on steps and add `vercel.json` with `rootDirectory`.
