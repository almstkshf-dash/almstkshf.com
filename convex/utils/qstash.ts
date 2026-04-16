/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use node";
import { Client } from "@upstash/qstash";
import { ActionCtx } from "../_generated/server";
import { resolveApiKey } from "./keys";

/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * QSTASH UTILITY
 * 
 * Provides a configured QStash client for Convex Actions.
 * Uses resolveApiKey to support User-level, System-level and Env keys.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

export async function getQStashClient(ctx: ActionCtx) {
  const token = await resolveApiKey(ctx, "UPSTASH_QSTASH_TOKEN", "qstash");
  if (!token) {
    console.warn("âš ï¸ QStash: API Token not configured.");
    return null;
  }
  return new Client({ token });
}

/**
 * Publishes a message to QStash from within a Convex Action.
 */
export async function publishToQStash(
  ctx: ActionCtx,
  options: {
    url: string;
    body?: any;
    delay?: number; // seconds
    headers?: Record<string, string>;
  }
) {
  const client = await getQStashClient(ctx);
  if (!client) return null;

  try {
    const res = await client.publishJSON({
      url: options.url,
      body: options.body,
      delay: options.delay,
      headers: options.headers,
    });
    console.log(`ðŸš€ QStash: Published to ${options.url} (MsgID: ${res.messageId})`);
    return res;
  } catch (error) {
    console.error("âŒ QStash: Publish failed:", error);
    throw error;
  }
}
