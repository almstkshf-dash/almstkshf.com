"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
    if (process.env.NODE_ENV === "production") {
        throw new Error("NEXT_PUBLIC_CONVEX_URL is required in production.");
    }

    console.warn("NEXT_PUBLIC_CONVEX_URL is missing. Falling back to local Convex URL for development.");
}

const convex = new ConvexReactClient(convexUrl ?? "http://127.0.0.1:3210");

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
