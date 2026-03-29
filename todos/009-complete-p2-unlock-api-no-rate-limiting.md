---
status: complete
priority: p2
issue_id: "009"
tags: [code-review, security, api, rate-limiting]
dependencies: ["008"]
---

# 009 · `/api/unlock` has no rate limiting — brute-force possible

## Problem Statement

The `/api/unlock` endpoint verifies the case study password but has no rate limiting. An attacker who knows the endpoint exists can make unlimited guesses in rapid succession. The contact route (`/api/contact`) has an in-memory 5-req/hr rate limiter — `/api/unlock` has none.

**Why it matters:** The `CASE_STUDY_PASSWORD` is a single shared secret for all protected case studies. Brute-forcing it is practical if the password is short or dictionary-based.

## Findings

- **`/api/unlock/route.js`** ([src/app/api/unlock/route.js](../src/app/api/unlock/route.js)): only validates that `password` is a non-empty string, then does a timing-safe compare. No IP tracking, no lockout, no throttle.
- **`/api/contact/route.js`** ([src/app/api/contact/route.js](../src/app/api/contact/route.js:9-22)): has a sliding-window rate limiter (`RATE_LIMIT = 5`, `WINDOW_MS = 1hr`) with the same in-memory `ipLog` Map pattern — already written and available to copy.

## Proposed Solutions

### Option A — Copy the existing in-memory rate limiter (Recommended for now)
Reuse the same `isRateLimited` pattern already in `contact/route.js`. Tighter limits are appropriate for an auth endpoint: e.g. 10 attempts per IP per hour.

```js
const RATE_LIMIT = 10
const WINDOW_MS  = 60 * 60 * 1000
const ipLog      = new Map()

function isRateLimited(ip) {
  const now  = Date.now()
  const hits = (ipLog.get(ip) ?? []).filter(t => now - t < WINDOW_MS)
  if (hits.length >= RATE_LIMIT) return true
  ipLog.set(ip, [...hits, now])
  return false
}
```

Add the same `x-forwarded-for` extraction and early-return as in `contact/route.js`.

**Pros:** Zero new dependencies. Consistent with existing pattern. Immediate fix.
**Cons:** Same caveat as contact — per-Vercel-instance memory, resets on cold start.
**Effort:** Small | **Risk:** Low

### Option B — Progressive delay (fail-slow)
Return HTTP 429 after the first 5 failures from an IP, and add a 1-second artificial delay to every failed attempt regardless.

**Pros:** Slows brute-force even on fresh instances.
**Cons:** Slightly more complex; delays legitimate typos.
**Effort:** Small | **Risk:** Low

### Option C — Upstash KV rate limiter
Use `@upstash/ratelimit` for persistent, cross-instance rate limiting.

**Pros:** Survives cold starts, works across all serverless instances.
**Cons:** New dependency + Upstash account required. Overkill for a portfolio.
**Effort:** Medium | **Risk:** Low

## Recommended Action

*(Leave blank — to be filled during triage)*

## Technical Details

- **Affected file:** `src/app/api/unlock/route.js`
- **Pattern to copy:** `src/app/api/contact/route.js` lines 9–22
- **Suggested limits:** 10 attempts / IP / hour (looser than contact to account for legitimate mis-types)

## Acceptance Criteria

- [ ] After N failed attempts from the same IP, the endpoint returns 429 Too Many Requests
- [ ] The rate limit window resets after the configured duration
- [ ] Legitimate users who mistype the password a few times are not locked out immediately
- [ ] The pattern is consistent with the existing contact rate limiter

## Work Log

- **2026-03-29** — Found during whole-project code review. Contact route has rate limiting; unlock route does not.

## Resources

- Unlock API: [src/app/api/unlock/route.js](../src/app/api/unlock/route.js)
- Contact API (reference): [src/app/api/contact/route.js](../src/app/api/contact/route.js)
