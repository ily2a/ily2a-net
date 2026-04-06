---
status: pending
priority: p3
issue_id: "009"
tags: [code-review, security, configuration]
dependencies: []
---

# SANITY_REVALIDATION_SECRET is Empty — Revalidate Endpoint Always Returns 401

## Problem Statement
`SANITY_REVALIDATION_SECRET` is set to an empty string in `.env.local`. The auth check requires both the provided secret and the expected value to be truthy — an empty string is falsy — so `authorized` is always `false`. If this env var is also empty in Vercel, Sanity webhook-triggered ISR revalidation will never fire, silently breaking on-demand cache invalidation.

## Findings

- **`src/app/api/revalidate/route.js` line 11** — `authorized = secret && expected` — both must be truthy
- **`.env.local`** — `SANITY_REVALIDATION_SECRET=""` (empty string)
- **Impact:** Content changes in Sanity will not trigger immediate cache invalidation. The Live Content API still handles real-time updates for active sessions, but statically cached pages won't revalidate on demand.

## Proposed Solutions

### Option A: Set the secret in Vercel and .env.local
1. Generate a random secret: `openssl rand -hex 32`
2. Set `SANITY_REVALIDATION_SECRET=<value>` in Vercel environment variables
3. Set the same value in the Sanity webhook configuration (Authorization header)
4. Update `.env.local` for local testing

**Effort:** Small
**Risk:** Low

### Option B: Accept the limitation
If the Live Content API is relied upon for all real-time updates (active sessions), and ISR revalidation is not critical for the portfolio use case, document this as an accepted gap.

## Recommended Action
Option A — takes 5 minutes and restores the full revalidation pipeline.

## Technical Details
- **Affected files:** `.env.local`, `src/app/api/revalidate/route.js`
- **Sanity webhook:** Must send `Authorization: Bearer <secret>` header

## Acceptance Criteria
- [ ] `SANITY_REVALIDATION_SECRET` is a non-empty value in Vercel
- [ ] Sanity webhook is configured with matching secret
- [ ] Publishing a document in Sanity triggers revalidation (check Vercel logs)

## Work Log
- 2026-03-31: Identified during security review
