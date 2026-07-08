/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { useEffect, useState, useRef } from "react";

export type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

interface UseSSEPersistenceProps {
    onArticle: (article: any) => void;
    enabled?: boolean;
}

export function useSSEPersistence({ onArticle, enabled = true }: UseSSEPersistenceProps) {
    const [status, setStatus] = useState<ConnectionStatus>("disconnected");
    const [lastEventId, setLastEventIdState] = useState<number | null>(null);
    const lastEventIdRef = useRef<number | null>(null);

    const setLastEventId = (val: number) => {
        lastEventIdRef.current = val;
        setLastEventIdState(val);
    };

    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const watchdogTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const attemptRef = useRef<number>(0);
    
    // Store latest onArticle in a ref to avoid dependency re-triggers
    const onArticleRef = useRef(onArticle);
    onArticleRef.current = onArticle;

    // Use refs for the key functions to break circular dependencies & self-references
    const connectRef = useRef<() => void>(() => {});
    const reconnectRef = useRef<() => void>(() => {});
    const resetWatchdogRef = useRef<() => void>(() => {});

    // Helper to disconnect cleanly
    const disconnect = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (watchdogTimeoutRef.current) {
            clearTimeout(watchdogTimeoutRef.current);
            watchdogTimeoutRef.current = null;
        }
    };

    // Watchdog implementation
    resetWatchdogRef.current = () => {
        if (watchdogTimeoutRef.current) {
            clearTimeout(watchdogTimeoutRef.current);
        }
        // If we don't hear from the server (event or heartbeat) in 35 seconds, reconnect.
        watchdogTimeoutRef.current = setTimeout(() => {
            console.warn("[SSE Watchdog] Connection went silent. Reconnecting...");
            reconnectRef.current();
        }, 35000);
    };

    // Connect implementation
    connectRef.current = () => {
        disconnect();

        if (!enabled) {
            setStatus("disconnected");
            return;
        }

        setStatus(attemptRef.current > 0 ? "reconnecting" : "connecting");

        // Construct url with the 'since' parameter
        const sinceTime = lastEventIdRef.current || Date.now();
        const url = `/api/monitor/stream?since=${sinceTime}`;
        console.log(`[SSE] Connecting to: ${url} (Attempt ${attemptRef.current + 1})`);

        try {
            const es = new EventSource(url);
            eventSourceRef.current = es;

            // Start watchdog immediately on connection creation
            resetWatchdogRef.current();

            es.onopen = () => {
                console.log("[SSE] Connection established.");
                setStatus("connected");
                attemptRef.current = 0; // Reset connection attempts
                resetWatchdogRef.current();
            };

            es.onerror = (e) => {
                console.error("[SSE] Connection error. EventSource readyState:", es.readyState, e);
                es.close();
                setStatus("reconnecting");
                
                // Exponential backoff
                const delay = Math.min(1000 * Math.pow(2, attemptRef.current), 30000);
                attemptRef.current += 1;

                console.log(`[SSE] Reconnecting in ${delay}ms...`);
                reconnectTimeoutRef.current = setTimeout(() => {
                    connectRef.current();
                }, delay);
            };

            // Listen for standard article events
            es.addEventListener("article", (event: MessageEvent) => {
                resetWatchdogRef.current(); // Reset watchdog on message
                try {
                    const article = JSON.parse(event.data);
                    if (article && article.createdAt) {
                        const eventTime = article.createdAt;
                        
                        // Update lastEventId state and sessionStorage
                        setLastEventId(eventTime);
                        sessionStorage.setItem("almstkshf:sse:lastEventId", String(eventTime));
                        
                        // Trigger callback
                        onArticleRef.current(article);
                    }
                } catch (err) {
                    console.error("[SSE] Failed to parse article payload:", err);
                }
            });

            // Listen for any generic message (heartbeat or ping comments)
            es.onmessage = () => {
                resetWatchdogRef.current(); // Reset watchdog on any incoming frame
            };
        } catch (err) {
            console.error("[SSE] Failed to create EventSource:", err);
            setStatus("disconnected");
        }
    };

    // Reconnect implementation
    reconnectRef.current = () => {
        attemptRef.current = 0; // Manual reconnect resets attempts
        connectRef.current();
    };

    // Handle connection lifecycle based on enabled/disabled states
    useEffect(() => {
        // Read initial lastEventId on mount if not already loaded
        if (lastEventIdRef.current === null && typeof window !== "undefined") {
            const saved = sessionStorage.getItem("almstkshf:sse:lastEventId");
            let initialId: number;
            if (saved) {
                const parsed = parseInt(saved, 10);
                initialId = !isNaN(parsed) && parsed > 0 ? parsed : Date.now();
            } else {
                initialId = Date.now();
                sessionStorage.setItem("almstkshf:sse:lastEventId", String(initialId));
            }
            setLastEventId(initialId);
        }

        if (enabled) {
            connectRef.current();
        } else {
            disconnect();
            setStatus("disconnected");
        }

        return () => {
            disconnect();
        };
    }, [enabled]);

    // Expose reconnect wrapper that calls the ref version
    const triggerReconnect = () => {
        reconnectRef.current();
    };

    return {
        status,
        lastEventId,
        reconnect: triggerReconnect,
    };
}
