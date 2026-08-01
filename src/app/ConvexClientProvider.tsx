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

const rawConvexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isValidUrl = rawConvexUrl && !rawConvexUrl.includes("<your-convex-deployment-url>") && (rawConvexUrl.startsWith("http://") || rawConvexUrl.startsWith("https://"));
const fallbackConvexUrl = "https://example.invalid";

if (!isValidUrl) {
    console.warn(
        "[ConvexClientProvider] NEXT_PUBLIC_CONVEX_URL is missing or invalid. " +
        "Convex-backed features will be unavailable until a valid deployment URL is configured."
    );
}

const convex = new ConvexReactClient(isValidUrl ? rawConvexUrl! : fallbackConvexUrl);

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
