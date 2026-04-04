---
description: Integrates a new data source into the Node.js monitoring action and updates the UI.
---

1. Ask for the `[SourceName]` and the `[API_Endpoint]`.
2. Update `convex/monitoringAction.ts`:
   - Add a new private helper function `fetchFrom[SourceName]`.
   - Integrate the fetcher into the main `fetchAndStore` action.
   - Ensure Gemini sentiment analysis is applied to results before storage.
3. Update `convex/schema.ts` if the new source requires unique metadata fields in `media_monitoring_articles`.
4. Add the source toggle/indicator to `src/components/media-pulse/NewsGenerator.tsx`.
5. Add the source name to `Navigation` and `Dashboard` namespaces in both `messages/ar.json` and `messages/en.json`.
6. // turbo Run `npx convex dev` to sync the updated action and schema.