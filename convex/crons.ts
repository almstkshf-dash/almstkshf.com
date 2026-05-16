/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

// ===================================================================
// SCHEDULED JOBS - Deep Web Monitoring Auto-Ingestion

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
// SCHEDULED JOBS - Deep Web Monitoring Auto-Ingestion
// Runs every 6 hours to keep deep monitoring data fresh.
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 

const crons = cronJobs();

// Deep web scan - every 6 hours, covers Arab region in EN + AR
crons.interval(
    "deep-web-sweep",
    { hours: 6 },
    api.deepSources.fetchDeepSources,
    {
        languages: "en,ar",
        countries: "ae,sa,eg,kw,bh",
        limit: 30,
    }
);

crons.daily(
    "check-subscriptions",
    { hourUTC: 0, minuteUTC: 0 },
    api.payments.checkSubscriptions
);

// ── RSS Wire Sweep ─────────────────────────────────────────────────────────
// Auto-ingests all PR_WIRE_FEEDS (UAE + international sources) every 4 hours.
// No keyword = defaults to "Press Release" as the monitoring keyword.
// Runs without user auth (cron-safe pattern in fetchPressReleaseSources).
crons.interval(
    "press-release-sweep",
    { hours: 4 },
    api.monitoringAction.fetchPressReleaseSources,
    { limit: 20 }
);

export default crons;
