"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
    if (process.env.NODE_ENV === "production") {
        // Hard fail in production — a missing URL means all Convex queries will silently return undefined.
        throw new Error(
            "[ConvexClientProvider] NEXT_PUBLIC_CONVEX_URL is not set. " +
            "Add it to your Vercel environment variables (Settings → Environment Variables)."
        );
    } else {
        console.warn(
            "[ConvexClientProvider] NEXT_PUBLIC_CONVEX_URL is missing. " +
            "Falling back to http://127.0.0.1:3210 for local development."
        );
    }
}

const convex = new ConvexReactClient(convexUrl || "http://127.0.0.1:3210");

/**
 * Provides the Convex client with Clerk auth integration.
 * NOTE: This component must always be rendered inside <ClerkProvider>,
 * which lives in [locale]/layout.tsx (a Server Component) to guarantee
 * a single, top-level Clerk initialisation before any useAuth() calls.
 */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
    return (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            {children}
        </ConvexProviderWithClerk>
    );
}
