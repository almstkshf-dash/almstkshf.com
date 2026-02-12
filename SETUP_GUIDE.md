# ALMSTKSHF - Setup Guide

## 1. Project Initialization
This project uses **Next.js 16 (App Router)**, **Tailwind CSS v4**, **Convex**, and **next-intl**.

## 2. Environment Variables
Ensure your `.env.local` contains:
```bash
NEXT_PUBLIC_CONVEX_URL="https://your-project.convex.cloud"
```
*Locally, run `npx convex dev` and choose "Configure this project with an existing one" to automatically set this up.*

## 3. Deployment
This project is configured for Vercel.
1. Push to GitHub.
2. Import in Vercel.
3. In Vercel Settings -> Integrations, add **Convex**.

## 4. Local Development
```bash
npm install
npm run dev
```

## 5. Troubleshooting Build Errors
If you encounter `postcss` or `tailwindcss` errors during build:
1. Delete `node_modules` and `.next` folder.
2. Delete `package-lock.json`.
3. Run `npm install`.
4. Run `npm run build`.
