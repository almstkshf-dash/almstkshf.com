"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const configuredConvexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!configuredConvexUrl) {
    console.warn("NEXT_PUBLIC_CONVEX_URL is missing. Falling back to local Convex URL.");
}

const convexUrl = configuredConvexUrl ?? "http://127.0.0.1:3210";
const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
