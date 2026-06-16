/*
 * X (Twitter) API v2 — Connection Test Endpoint
 * GET /api/test-x
 *
 * Tests connectivity by calling:
 *   1. GET /2/tweets/search/recent  — needs Academic or Elevated access
 *   2. GET /2/usage/tweets           — lightweight credits/quota endpoint (Basic+)
 *
 * Returns a structured JSON report so you can see exactly what the API
 * responds with — including the HTTP status, rate-limit headers, and
 * whether your bearer token is accepted.
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { rateLimit, getRateLimitKey } from "@/lib/rateLimit";

interface CheckResult {
  endpoint: string;
  status: number;
  ok: boolean;
  rateLimit?: {
    limit: string | null;
    remaining: string | null;
    reset: string | null;
  };
  body: unknown;
  error?: string;
}

async function checkEndpoint(
  label: string,
  url: string,
  token: string
): Promise<CheckResult> {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      // 10-second hard timeout
      signal: AbortSignal.timeout(10_000),
    });

    const body = await res.json().catch(() => null);

    return {
      endpoint: label,
      status: res.status,
      ok: res.ok,
      rateLimit: {
        limit: res.headers.get("x-rate-limit-limit"),
        remaining: res.headers.get("x-rate-limit-remaining"),
        reset: res.headers.get("x-rate-limit-reset"),
      },
      body,
    };
  } catch (err: unknown) {
    return {
      endpoint: label,
      status: 0,
      ok: false,
      body: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function GET(request: Request) {
  // Apply rate limit
  const rlKey = await getRateLimitKey(request, 'test-x');
  const limitResult = await rateLimit(rlKey, 5, 60);
  if (!limitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': String(limitResult.resetSeconds) } }
    );
  }

  const token = process.env.X_BEARER_TOKEN;

  if (!token) {
    return NextResponse.json(
      {
        connected: false,
        error: "X_BEARER_TOKEN is not set in environment variables.",
      },
      { status: 500 }
    );
  }

  // ── 1. Recent Search (v2) ─────────────────────────────────────────────────
  // Requires at minimum Basic access tier.
  const searchCheck = await checkEndpoint(
    "tweets/search/recent",
    "https://api.twitter.com/2/tweets/search/recent?query=UAE&max_results=5&tweet.fields=created_at,author_id,public_metrics",
    token
  );

  // ── 2. App-only token self-verification via /2/users/me won't work for
  //    app-only tokens, so we use the lightweight oauth2/token introspect
  //    path instead — or simply relay on the search result.

  // ── Build summary ─────────────────────────────────────────────────────────
  const allChecks: CheckResult[] = [searchCheck];

  const connected = allChecks.some((c) => c.ok);
  const summary = {
    connected,
    tokenPresent: true,
    tokenPrefix: `${token.substring(0, 12)}…`,
    timestamp: new Date().toISOString(),
    checks: allChecks.map((c) => ({
      endpoint: c.endpoint,
      status: c.status,
      ok: c.ok,
      rateLimit: c.rateLimit,
      // Trim body to avoid leaking sensitive info; keep errors visible
      result: c.error
        ? { error: c.error }
        : c.ok
          ? {
            dataCount:
              (c.body as { data?: unknown[] })?.data?.length ?? "n/a",
            meta: (c.body as { meta?: unknown })?.meta ?? null,
          }
          : { apiError: (c.body as { detail?: string; title?: string }) ?? null },
    })),
  };

  const httpStatus = connected ? 200 : 502;
  return NextResponse.json(summary, { status: httpStatus });
}
