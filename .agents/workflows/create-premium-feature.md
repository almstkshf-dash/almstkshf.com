---
description: Develops a feature restricted to "Standard" or "Professional" subscribers.
---

1. Ask for the `[FeatureName]` and the `[MinimumTier]` (Standard/Professional).
2. Create the feature component in `src/components/`.
3. Wrap the component or the route in `src/app/[locale]/` with a subscription check:
   - Use the `userSettings` table (Convex) to verify `isSubscribed` and `planId`.
   - Cross-reference `planId` with constants in `src/lib/stripe-products.ts`.
4. If the user is not subscribed, implement a "Locked" state that triggers the `CheckoutButton.tsx` pointing to the correct `PRICE_ID`.
5. Add "Upgrade Required" strings to `messages/ar.json` and `messages/en.json`.
6. // turbo-all Commit the changes with a message: "feat: add premium [FeatureName] gated by [MinimumTier] tier".