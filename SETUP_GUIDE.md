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

## 4. Authentication (Clerk + Convex)
This project uses **Clerk** for identity and **Convex** for the backend database.

1. **Create a Clerk App**:
   - Go to [clerk.com](https://clerk.com) and create a new application.
   - Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to your `.env.local`.

2. **Connect Clerk to Convex**:
   - In Convex Dashboard, go to **Settings** -> **Auth**.
   - Click **Add Configuration**.
   - Choose **Clerk**.
   - Enter your **Issuer URL** (found in Clerk -> Auth -> JWT Templates -> Convex).
   - Click **Create Config**.

3. **Vercel Setup**:
   - Add your Clerk keys to Vercel Environment Variables.
   - The app is already configured to use these keys in `ConvexClientProvider.tsx`.

## 5. Local Development
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

## 6. Implementation Tracker

### ✅ Phase 1: Foundation (Completed)
- [x] Initial Project Setup (Next.js 16, Tailwind v4)
- [x] i18n Infrastructure (next-intl, RTL/LTR support)
- [x] Convex Backend Schema & Setup
- [x] Vercel & GitHub Integration (vercel.json)
- [x] Global Navigation (Navbar with glassmorphism)
- [x] Primary Localization (App Name, Slogan, ChatGPT CTA)
- [x] Localized Hero Section with animations

### 🏗️ Phase 2: Core Components (In Progress)
- [x] **Professional Footer**: 4-column layout (Links, Legal, Switcher, Socials)
- [x] **Skeleton Loaders**: Smooth transitions while fetching data from Convex
- [x] **Enhanced Image Handling**: Optimized loading for tech/data imagery
- [x] **Dynamic Page Scaffolding**: 
    - [x] Initial Scaffolding of all routes
    - [x] Detailed View for Lexcura Lawyer
    - [x] Detailed View for Smart Styling Assistant

### 📊 Phase 3: Media Monitoring Module
- [x] Media Monitoring Dashboard Layout
- [x] Crisis Management Plan Cards
- [x] **Convex Data Seeding**: Initial sample reports and crisis plans
- [x] **Live Sentiment Analysis**: Placeholder/Module in Media Pulse
- [x] **Reporting System**: Periodic reports PDF generation logic

### 🔒 Phase 4: Technical Solutions & Identity
- [x] **Integration Hub**: API Key management UI
- [x] **KYC Compliance**: Status checks and verification flow
- [x] **Authentication**: Integrated with Clerk & Convex Auth

