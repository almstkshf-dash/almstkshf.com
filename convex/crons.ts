/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SCHEDULED JOBS â€” Deep Web Monitoring Auto-Ingestion
// Runs every 6 hours to keep deep monitoring data fresh.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const crons = cronJobs();

// Deep web scan â€” every 6 hours, covers Arab region in EN + AR
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

export default crons;
