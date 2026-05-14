/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

/**
 * Robust retry utility for AI API calls.
 * Handles exponential backoff and specific 503 Capacity Exhausted errors.
 */

export interface AiRetryOptions {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
}

export interface AiCallResult<T> {
    success: boolean;
    data?: T;
    error?: string;
    retryAfter?: number; // seconds
    capacityExhausted?: boolean;
}

export async function callWithAiRetry<T>(
    callFn: () => Promise<Response>,
    options: AiRetryOptions = {}
): Promise<AiCallResult<T>> {
    const {
        maxRetries = 3,
        initialDelayMs = 1000,
        maxDelayMs = 30000,
    } = options;

    let currentDelay = initialDelayMs;
    let lastError = "";

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await callFn();

            if (response.ok) {
                const data = await response.json();
                return { success: true, data: data as T };
            }

            const status = response.status;
            let errorText = "";
            try {
                errorText = await response.text();
            } catch {
                errorText = "Unknown error body";
            }

            // Handle 503 Capacity Exhausted specifically
            if (status === 503 || errorText.includes("MODEL_CAPACITY_EXHAUSTED") || errorText.includes("exhausted")) {
                let retryDelay = 30; // default 30s
                
                try {
                    const errorJson = JSON.parse(errorText);
                    // Google Gemini specific RetryInfo
                    const retryInfo = errorJson.error?.details?.find((d: any) => d["@type"]?.includes("RetryInfo"));
                    if (retryInfo?.retryDelay) {
                        // "46s" -> 46
                        retryDelay = parseInt(retryInfo.retryDelay.replace("s", ""), 10) || 30;
                    }
                } catch {
                    // fall back to default
                }

                console.warn(`âš ï¸  AI Capacity Exhausted (Attempt ${attempt + 1}). Status: ${status}. Retry-after: ${retryDelay}s`);
                
                // If it's the last attempt or we want to signal the UI immediately
                if (attempt === maxRetries) {
                    return { 
                        success: false, 
                        error: "Model capacity exhausted", 
                        capacityExhausted: true,
                        retryAfter: retryDelay 
                    };
                }
            }

            // For other errors, log and potentially retry if it's a 5xx
            lastError = `API Error ${status}: ${errorText.substring(0, 200)}`;
            console.error(`â Œ AI Call Attempt ${attempt + 1} failed: ${lastError}`);

            if (status < 500 && status !== 429) {
                // Client error (except 429), don't bother retrying
                return { success: false, error: lastError };
            }

        } catch (error: any) {
            lastError = error.message || String(error);
            console.error(`â Œ AI Call Attempt ${attempt + 1} exception:`, error);
        }

        if (attempt < maxRetries) {
            console.log(`â ³ Retrying in ${currentDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, currentDelay));
            currentDelay = Math.min(currentDelay * 2, maxDelayMs);
        }
    }

    return { success: false, error: `Failed after ${maxRetries + 1} attempts: ${lastError}` };
}
