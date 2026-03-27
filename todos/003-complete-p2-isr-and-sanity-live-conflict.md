---
status: pending
priority: p2
issue_id: "003"
tags: [code-review, architecture, performance]
dependencies: []
---

# ISR revalidate=3600 and SanityLive used together without tokens

## Problem Statement

`src/app/craft/[slug]/page.js` exports `revalidate = 3600` (ISR, 1-hour TTL) while using `sanityFetch` from `next-sanity/live`. The live client is configured with `serverToken: false` and `browserToken: false`, which **disables** the live content API entirely. This means:

1. `SanityLive` in the layout renders but does nothing (no real-time updates)
2. Updates to case study content take up to 1 hour to appear
3. Bundle overhead from the live infrastructure is paid with no benefit

The same pattern is used in the sitemap and homepage, though the homepage has no explicit `revalidate` (defaults to dynamic/no-cache, which means full SSR on every request — also suboptimal given Sanity's CDN).

## Findings

- `src/sanity/lib/live.js:8-11` — `serverToken: false`, `browserToken: false`
- `src/app/craft/[slug]/page.js:15` — `export const revalidate = 3600`
- `src/app/layout.js:79` — `<SanityLive />` renders in the layout for all pages
- `src/app/page.js` — no `revalidate` export → dynamic rendering on every request

## Proposed Solutions

### Option A — Use ISR only, drop live infrastructure (Recommended for static portfolio)
- Keep `revalidate = 3600` (or set to `false` for fully static with on-demand revalidation via Sanity webhook)
- Replace `sanityFetch` with direct `client.fetch()` from `src/sanity/lib/client.js`
- Remove `<SanityLive />` from the layout
- This is the simplest, most predictable model for a portfolio site

- **Pros**: No live bundle overhead, predictable caching, less complexity
- **Cons**: Content updates take up to 1 hour (or whatever TTL you set)
- **Effort**: Small
- **Risk**: Low

### Option B — Enable live content API with a server token
- Add a `SANITY_API_READ_TOKEN` env var (server-only, non-NEXT_PUBLIC)
- Pass it as `serverToken` in `defineLive`
- This enables real-time content streaming from Sanity

- **Pros**: Live content updates, no ISR lag
- **Cons**: Requires a Sanity API token with read access; more complex setup; slightly higher Sanity API usage
- **Effort**: Medium
- **Risk**: Low (read-only token)

### Option C — On-demand ISR via Sanity webhook
- Set `revalidate = false` (fully static, no TTL)
- Configure a Sanity webhook to call Next.js `revalidatePath('/craft/[slug]')` on publish
- The page updates immediately when content is published in Studio

- **Pros**: Instant updates, zero live bundle overhead, no repeated ISR misses
- **Cons**: Requires webhook setup and a revalidation API route
- **Effort**: Medium
- **Risk**: Low

## Recommended Action

Option A if content doesn't change often (portfolio). Option C if you want instant updates without live complexity.

## Technical Details

- **Affected files**: `src/sanity/lib/live.js`, `src/app/craft/[slug]/page.js`, `src/app/layout.js`, `src/app/page.js`, `src/app/craft/page.js`

## Acceptance Criteria

- [ ] No dead live-content infrastructure running in production
- [ ] Content strategy is intentional: either ISR, live-with-token, or webhook-driven
- [ ] Homepage has a `revalidate` export or is intentionally static

## Work Log

- 2026-03-27: Found during full project code review — live client configured with no tokens (disabled) while ISR is in use.
