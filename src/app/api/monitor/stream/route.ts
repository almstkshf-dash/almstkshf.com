/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export const dynamic = 'force-dynamic';
import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { rateLimit, getRateLimitKey } from "@/lib/rateLimit";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
    // 1. Rate Limiting
    const rlKey = await getRateLimitKey(req, 'monitor:stream');
    const limitResult = await rateLimit(rlKey, 30, 60); // 30 requests per minute
    if (!limitResult.allowed) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
            status: 429,
            headers: {
                "Content-Type": "application/json",
                "Retry-After": String(limitResult.resetSeconds)
            }
        });
    }

    // 2. Parse last event ID or 'since' timestamp
    const { searchParams } = new URL(req.url);
    const lastEventIdHeader = req.headers.get("last-event-id");
    const sinceParam = searchParams.get("since") || lastEventIdHeader;
    
    // We expect the timestamp in milliseconds as ID
    let since = sinceParam ? parseInt(sinceParam, 10) : Date.now();
    if (isNaN(since) || since <= 0) {
        since = Date.now();
    }

    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    let isClosed = false;

    // Helper to write data to SSE stream
    const sendSSE = async (event: string, data: any, id?: string) => {
        if (isClosed) return;
        try {
            let message = "";
            if (id) message += `id: ${id}\n`;
            if (event) message += `event: ${event}\n`;
            message += `data: ${JSON.stringify(data)}\n\n`;
            await writer.write(encoder.encode(message));
        } catch (e) {
            console.error("SSE stream write error:", e);
            cleanup();
        }
    };

    const cleanup = () => {
        if (isClosed) return;
        isClosed = true;
        try {
            writer.close();
        } catch (e) {
            // Stream might already be closed
        }
    };

    // 3. Heartbeat & Database polling loop
    // Periodically query Convex for any articles created after `since`.
    // In SSE, to keep connections open, we send comment heartbeats periodically.
    let heartbeatTick = 0;
    const intervalId = setInterval(async () => {
        if (isClosed) {
            clearInterval(intervalId);
            return;
        }

        try {
            heartbeatTick += 3000;
            // Send heartbeat comment every 15 seconds to prevent browser/proxy timeouts
            if (heartbeatTick >= 15000) {
                heartbeatTick = 0;
                if (!isClosed) {
                    await writer.write(encoder.encode(": heartbeat\n\n"));
                }
            }

            // Fetch new articles since our last timestamp
            const newArticles = await convex.query(api.monitoring.getArticlesSince, {
                since,
                limit: 30
            });

            if (newArticles && newArticles.length > 0) {
                for (const article of newArticles) {
                    // Update since pointer to the most recently sent article's timestamp
                    if (article.createdAt > since) {
                        since = article.createdAt;
                    }
                    await sendSSE("article", article, String(article.createdAt));
                }
            }
        } catch (err) {
            console.error("Error during SSE database query or client write:", err);
            clearInterval(intervalId);
            cleanup();
        }
    }, 3000);

    // If client disconnects (navigates away, closes tab, loses connection), stop polling and free resources
    req.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        cleanup();
    });

    return new Response(responseStream.readable, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform, no-store, must-revalidate",
            "Connection": "keep-alive",
            "Content-Encoding": "none", // Do not compress/buffer
        },
    });
}
