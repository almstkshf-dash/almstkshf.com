'use server';

import { resolveGeminiKey as resolve } from "@/lib/gemini-key-resolver";

/**
 * Server Action to resolve the Gemini Key.
 * Useful for client-side components to check if they have access.
 */
export async function resolveGeminiKey() {
    return await resolve();
}
