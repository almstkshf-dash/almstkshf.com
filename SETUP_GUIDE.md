# ALMSTKSHF - Setup Guide

## 1. Project Initialization
This project uses **Next.js 16 (App Router)**, **Tailwind CSS v4**, **Convex**, and **next-intl**.

## 2. Environment Variables
Ensure your `.env.local` contains:
```bash
NEXT_PUBLIC_CONVEX_URL="https://your-project.convex.cloud"
```
*Locally, run `npx convex dev` and choose "Configure this project with an existing one" to automatically set this up.*

## 3. Deployment & Integration
This project is configured for Vercel with automated Convex deployments.

1. **Link Convex to Vercel**:
   - Go to your Vercel Project Settings -> Integrations.
   - Add **Convex**.
   - Ensure "Production" and "Preview" environments are enabled.
   - Keep "Custom Prefix" empty.
   
2. **Build Configuration**:
   - We have added a `vercel.json` file to the root.
   - This automatically overrides the build command to: `npx convex deploy --cmd 'npm run build'`.
   - **You do NOT need to manually change settings in Vercel dashboard.**

3. **Deploy**:
   - Push your changes to GitHub.
   - Vercel will detect `vercel.json` and handle the rest.

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
