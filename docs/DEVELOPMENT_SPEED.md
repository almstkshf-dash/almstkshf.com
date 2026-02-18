# ⚡ Development Speed Guide

> **Objective:** Reduce friction and build features 10x faster.

## 🚀 The "Unified Command"
Stop running separate terminals. Use this single command to start Next.js + Convex + Type Generation:
```bash
npm run dev
```
*(This now runs `concurrently` under the hood)*

---

## 🛠️ Feature Development Pattern (The 3-Step Flow)

Instead of jumping between files randomly, follow this exact sequence to add a feature:

### Step 1: Define Data (Backend)
Go to `convex/schema.ts` and add your table. 
*Constraint:* Keep schemas simple. Use `v.string()`, `v.number()`, `v.boolean()` mostly.

### Step 2: Write Logic (API)
Create a file in `convex/myFeature.ts`.
*   **Query (Read):** For fetching data to display.
*   **Mutation (Write):** For changing data (create, update, delete).
*   **Action (External):** ONLY for calling 3rd party APIs (Stripe, OpenAI).

**Example Snippet:**
```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createItem = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    // 1. Auth Check (Always first)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // 2. Logic
    await ctx.db.insert("items", { title: args.title, userId: identity.subject });
  },
});
```

### Step 3: Build UI (Frontend)
Use `Client Components` for interactivity. Fetch data directly with hooks.

**The "Fast UI" Template (`src/components/MyFeature.tsx`):**
```tsx
"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function MyFeature() {
  // 1. Fetch Data (Real-time!)
  const items = useQuery(api.myFeature.list);
  const create = useMutation(api.myFeature.createItem);

  if (!items) return <div>Loading...</div>; // Skeleton here

  return (
    <div>
      {items.map(item => (
        <div key={item._id}>{item.title}</div>
      ))}
      <button onClick={() => create({ title: "New One" })}>Add</button>
    </div>
  );
}
```

---

## ⚠️ Anti-Patterns (What Slows You Down)

1.  **Over-using API Routes (`/api/...`):** 
    *   **Slow:** Creating a Next.js API route just to fetch data from Convex.
    *   **Fast:** Use `useQuery` directly in the component. Middleware handles the auth token automatically!

2.  **Middleware Logic Bloat:**
    *   **Slow:** Checking permissions in `middleware.ts`.
    *   **Fast:** Check permissions in the **Convex Mutation** (`ctx.auth.getUserIdentity()`). It's safer and faster.

3.  **Manual Type Definitions:**
    *   **Slow:** Creating TypeScript interfaces manually.
    *   **Fast:** Let Convex generate them. Run `npx convex dev` (which is now part of `npm run dev`).

---

## 🐛 Debugging Shortcuts

*   **Console Logs:** Check the browser console, NOT the terminal, for `Client Component` errors.
*   **Convex Dashboard:** Use `npx convex dashboard` to see your data instantly.
*   **Clerk Issues:** Check `Application` tab in Chrome DevTools -> Cookies. If `__session` is missing, you are signed out.
