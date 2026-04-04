---
description: Implements search relevancy filtering and manual sentiment correction
---

1. Update `convex/monitoringAction.ts` to include a `validateRelevancy` step using Gemini before calling `ctx.runMutation`.
2. Modify `convex/schema.ts` to add a `manualSentimentOverride` boolean and `originalSentiment` string to the `media_monitoring_articles` table.
3. In `src/components/media-pulse/ArticleTable.tsx`, add a dropdown to each row allowing the user to change the sentiment badge.
4. Create `src/lib/report-exporter.ts` to handle the `jsPDF` logic for "Press," "Deep Web," and "OSINT" namespaces.
5. // turbo Run `npx convex dev` to push the schema changes and update the ingestion logic.