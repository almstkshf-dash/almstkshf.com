/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ReactNode, useEffect } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
    if (process.env.NODE_ENV === "production") {
        // Hard fail in production â€” a missing URL means all Convex queries will silently return undefined.
        throw new Error(
            "[ConvexClientProvider] NEXT_PUBLIC_CONVEX_URL is not set. " +
            "Add it to your Vercel environment variables (Settings â†’ Environment Variables)."
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
    useEffect(() => {
        // Bfcache (Back/Forward Cache) Optimization:
        // WebSocket connections are active blockers for Bfcache in some browsers.
        // By closing the connection on pagehide, we allow the page to be cached.
        // Convex automatically re-opens the connection when the page is restored or a query is needed.
        const handlePageHide = () => {
            convex.close();
        };

        window.addEventListener("pagehide", handlePageHide);
        return () => window.removeEventListener("pagehide", handlePageHide);
    }, []);

    return (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            {children}
        </ConvexProviderWithClerk>
    );
}
