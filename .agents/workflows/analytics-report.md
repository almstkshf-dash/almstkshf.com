---
description: Generates a new analytics component with Convex data, i18n support, and valid chart color resolution.
---

1. Ask for the `[ReportName]` and the specific `ConvexQuery` it should consume.
2. Create `src/components/media-pulse/[ReportName].tsx`. 
   - Use a native `<button>` for interactions (h-9, text-xs, rounded-lg).
   - Implement the `getCSSVar` useEffect pattern to resolve `--primary` hex values for SVG/Recharts.
3. Update `src/app/[locale]/dashboard/page.tsx` to import and place the new component within the `DashboardGrid`.
4. Add translation keys for `[ReportName]` to both `messages/en.json` and `messages/ar.json`.
5. Create a new Convex query in `convex/media.ts` to provide the specific data aggregation needed.
6. // turbo Run `npm run lint` to ensure no i18n or dependency array violations.