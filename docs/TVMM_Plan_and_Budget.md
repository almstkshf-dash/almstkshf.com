# TVMM Phase 1 — Source Layer + Player: Dev-Ready Tickets

Target: Convex + Next.js (TS). Each ticket has acceptance criteria so it can be handed off directly.

---

## Schema (Convex)

```ts
// convex/schema.ts (additions)

tv_sources: defineTable({
  provider: v.string(),            // "xtream" | "m3u" | "m3u8"
  type: v.union(v.literal("xtream"), v.literal("m3u"), v.literal("m3u8")),
  url: v.string(),
  username: v.optional(v.string()),
  password: v.optional(v.string()),  // store encrypted, see TV-006
  epgUrl: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  status: v.union(v.literal("active"), v.literal("error"), v.literal("disabled")),
  lastSyncedAt: v.optional(v.number()),
  lastError: v.optional(v.string()),
  createdAt: v.number(),
}).index("by_status", ["status"]),

tv_channels: defineTable({
  sourceId: v.id("tv_sources"),
  channelId: v.string(),           // provider's native channel id
  name: v.string(),
  logo: v.optional(v.string()),
  group: v.optional(v.string()),   // "News" | "Sports" | etc.
  streamUrl: v.string(),
  epgId: v.optional(v.string()),
  isFavorite: v.boolean(),
  isDead: v.boolean(),             // set by health check, TV-007
  lastCheckedAt: v.optional(v.number()),
}).index("by_source", ["sourceId"])
  .index("by_favorite", ["isFavorite"])
  .index("by_group", ["group"])
  .searchIndex("search_name", { searchField: "name" }),
```

---

## Tickets

### TV-001: `tv_sources` + `tv_channels` schema
**Description:** Add the two tables above to `convex/schema.ts`, deploy, verify indexes build.
**Acceptance criteria:**
- Schema deploys with no errors.
- `by_status`, `by_source`, `by_favorite`, `by_group` indexes exist and are queryable.
- `search_name` full-text index returns results for partial channel name matches.
**Effort:** 0.5 day

---

### TV-002: Xtream Codes connector
**Description:** Implement a Convex **action** (not mutation — this calls external HTTP) that authenticates against an Xtream Codes panel and pulls the channel list + categories.
**API shape:**
```ts
// convex/tv/sources.ts
export const connectXtream = action({
  args: { url: v.string(), username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    // GET {url}/player_api.php?username=...&password=...
    // on success: create tv_sources row, then fetch get_live_streams + get_live_categories
    // insert tv_channels rows via internal mutation
  }
});
```
**Acceptance criteria:**
- Invalid credentials return a typed error (`AuthExpiredError`), not a raw fetch exception.
- Successful connect creates 1 `tv_sources` row and N `tv_channels` rows matching the panel's live stream count.
- Channel `group` field is populated from `get_live_categories`.
- Credentials are never logged (scrub username/password from any console/error output — Xtream URLs embed them in query strings).
**Effort:** 2 days

---

### TV-003: M3U parser
**Description:** Convex action that fetches an M3U URL, parses `#EXTINF` entries, creates a `tv_sources` row (type: "m3u") and associated `tv_channels`.
**Suggested lib:** `iptv-playlist-parser` (or equivalent) run inside the action.
**Acceptance criteria:**
- Parses `tvg-name`, `tvg-logo`, `group-title` attributes into `name`, `logo`, `group`.
- Malformed lines are skipped with a warning logged, not a hard failure of the whole import.
- Duplicate channel URLs within one playlist are deduped.
**Effort:** 1 day

---

### TV-004: M3U8 parser
**Description:** Same as TV-003 but for M3U8 playlists (HLS master playlists used directly as a source list, distinct from M3U text playlists).
**Acceptance criteria:** same as TV-003, plus: correctly distinguishes a master playlist (multiple variants) from a single-stream playlist and stores only the highest-bitrate variant as `streamUrl` by default.
**Effort:** 1 day

---

### TV-005: Channel groups, favorites, search UI
**Description:** Next.js page `/app/(dashboard)/tv/page.tsx` with a sidebar listing groups, a favorite toggle per channel, and a search box wired to `search_name` index.
**Acceptance criteria:**
- Sidebar groups channels by `group` field, collapsible.
- Clicking the star icon toggles `isFavorite` via a Convex mutation, UI updates optimistically.
- Search box filters visible channel list in <300ms for a 500-channel source.
**Effort:** 1.5 days

---

### TV-006: Credential encryption
**Description:** Xtream username/password must not be stored in plaintext in Convex.
**Approach:** encrypt at rest using a server-side key (env var), decrypt only inside the action that needs to call the Xtream API.
**Acceptance criteria:**
- `tv_sources.password` is unreadable as plaintext if the Convex dashboard/data is inspected directly.
- Decryption happens only inside the action, never returned to the client.
**Effort:** 1 day

---

### TV-007: Channel health check (dead-URL handling)
**Description:** Scheduled Convex function (cron, e.g. every 30 min) that pings each `streamUrl` (HEAD request or short HLS manifest fetch) and flags `isDead: true` if unreachable.
**Acceptance criteria:**
- Dead channels are visually greyed out in the UI (not deleted).
- `tv_sources.status` flips to `"error"` if >50% of its channels are dead, with `lastError` populated.
- Health check does not block the main app — runs as a background scheduled function.
**Effort:** 1 day

---

## Phase 1 Total: **8 dev-days** (matches earlier 5–8 day estimate, upper bound with encryption + health check included)

---

## Phase 1.5 — Player (separate PR, same sprint)

### TV-101: Lightweight HLS.js player component
**Description:** `/app/(dashboard)/tv/player/Player.tsx` — wraps `hls.js` + native `<video>`. Accepts `streamUrl` prop.
**Acceptance criteria:**
- Falls back to native HLS support on Safari (skip hls.js if `video.canPlayType('application/vnd.apple.mpegurl')`).
- Bundle size contribution from hls.js stays under ~100KB gzipped.
**Effort:** 1.5 days

### TV-102: Playback error recovery + reconnect
**Description:** Listen to `hls.js` `ERROR` events; on network/media error, attempt retry with exponential backoff (3 attempts) before showing a "channel unavailable" state.
**Acceptance criteria:**
- Transient network blips (<5s) recover without user-visible error.
- After 3 failed retries, UI shows a clear offline state and marks channel for health-check re-verification (ties into TV-007).
**Effort:** 1.5–2 days

### TV-103/104: Fullscreen + volume controls
**Effort:** 0.5 day combined, standard `<video>` API usage.

**Player total: 3.5–4.5 dev-days**

---

## Suggested Ticket Order

1. TV-001 (schema) →
2. TV-002 + TV-003 + TV-004 (parallel if 2 devs, sequential if 1) →
3. TV-006 (encryption, do before real credentials touch the system) →
4. TV-005 (UI) →
5. TV-101/102/103/104 (player, can start in parallel with TV-005) →
6. TV-007 (health check, last — needs channels to already exist)


### the SOURCE LAYER API: tpps://monraco.xyz:8080
- user name: tamer2027
- password 202766456

