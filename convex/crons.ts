import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

// ═══════════════════════════════════════════════════════════════════
// SCHEDULED JOBS — Deep Web Monitoring Auto-Ingestion
// Runs every 6 hours to keep deep monitoring data fresh.
// ═══════════════════════════════════════════════════════════════════

const crons = cronJobs();

// Deep web scan — every 6 hours, covers Arab region in EN + AR
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
