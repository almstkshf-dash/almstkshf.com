"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "http://127.0.0.1:3210";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    console.warn("NEXT_PUBLIC_CONVEX_URL is missing. Falling back to local Convex URL for non-production environments.");
}

const convex = new ConvexReactClient(convexUrl);

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
