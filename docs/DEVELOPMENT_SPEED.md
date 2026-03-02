# Development Speed Reference

> Quick lookup for recurring tasks

---

## Adding a Feature (End-to-End Checklist)

- [ ] Create Convex function in `convex/myFeature.ts`
- [ ] Add to `convex/_generated/api.ts` (auto via `convex dev`)
- [ ] Create page at `src/app/[locale]/my-route/page.tsx`
- [ ] Create client component if interactive in `src/components/MyComponent.tsx`
- [ ] Add route to `isPublicRoute` in `src/middleware.ts` if public
- [ ] Add nav link in `src/components/Navbar.tsx`
- [ ] Add translation keys to **both** `messages/ar.json` and `messages/en.json`
- [ ] Test in Arabic locale (`/ar/...`)
- [ ] Test in English locale (`/en/...`)

---

## Common Code Patterns

### Convex Query in Client Component
```tsx
'use client';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function MyComponent() {
  const data = useQuery(api.myFeature.getItems, { userId: 'xxx' });
  if (!data) return <div>Loading...</div>;
  return <div>{data.length} items</div>;
}
```

### Convex Mutation
```tsx
const createItem = useMutation(api.myFeature.createItem);
await createItem({ title: 'Hello' });
```

### Convex Action (outside components, in API route)
```typescript
// src/app/api/my-route/route.ts
import { ConvexHttpClient } from 'convex/browser';
const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const result = await client.action(api.myFeature.doSomething, { param: value });
```

### Translation (Component)
```tsx
import { useTranslations } from 'next-intl';
const t = useTranslations('MyNamespace');
// → t('my_key')
// → t('nested.key')
// → t('with_variable', { count: 5 })
```

### Server-side Translation (Server Component)
```tsx
import { getTranslations } from 'next-intl/server';
const t = await getTranslations('MyNamespace');
```

### Protected API Route
```typescript
import { auth } from '@clerk/nextjs/server';
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });
  // ...
}
```

---

## Debugging Translation Errors

```
MISSING_MESSAGE: Could not resolve `Namespace.key` in messages for locale `ar`
```

1. Open `messages/ar.json` and `messages/en.json`
2. Search for the namespace (`Namespace`)
3. Find the missing key inside that namespace
4. Add it to BOTH files

---

## Stripe Quick Reference

| Action | Where |
|---|---|
| Create checkout session | `POST /api/stripe/checkout` |
| Handle payment webhook | `POST /api/stripe/webhook` |
| Product/price IDs | `src/lib/stripe-products.ts` |
| Test webhook locally | `stripe listen --forward-to localhost:3001/api/stripe/webhook` |

---

## Convex Quick Reference

| Concept | Notes |
|---|---|
| `query` | Read-only. Cached, reactive. Cannot call external APIs. |
| `mutation` | Write operations. Cannot call external APIs. |
| `action` | Can call external APIs and other functions. Node.js runtime. |
| `internalQuery/Mutation/Action` | Same as above but only callable by other Convex functions |
| Scheduling | Use `ctx.scheduler.runAfter()` inside actions |

---

## Deployment Checklist

1. `git push origin main` → Vercel auto-deploys
2. If schema changed: `npx convex deploy`
3. Check Vercel deployment logs at vercel.com
4. Verify Stripe webhook endpoint in Stripe dashboard
5. Test a critical authenticated flow in production
