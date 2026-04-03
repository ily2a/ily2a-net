---
status: pending
priority: p3
issue_id: "003"
tags: [code-review, performance, security]
dependencies: []
---

# In-memory rate-limit maps grow unbounded between cold starts

## Problem Statement
Both `contact/route.js` and `unlock/route.js` use a module-level `Map` (`ipLog`) to track request timestamps. Old entries are filtered on every read but never deleted from the map. On a long-lived serverless instance (or local dev server), the map will accumulate one entry per unique IP indefinitely. For a portfolio site this is low-risk, but it is a known pattern worth closing.

The code's own comments acknowledge this limitation ("per-instance, resets on cold start") but don't address the unbounded growth of the map itself.

## Findings
- `contact/route.js:17–23` (`isRateLimited`): filters stale timestamps but never calls `ipLog.delete(ip)` when the hit list is empty.
- `unlock/route.js:10–16`: same pattern.
- A GC-hostile long-lived Node process would accumulate entries for every unique visitor.

## Proposed Solutions

### Option A — Delete empty entries after pruning (Recommended)
After filtering, if `hits` is empty and there's no active window, call `ipLog.delete(ip)`.

```js
function isRateLimited(ip) {
  const now  = Date.now()
  const hits = (ipLog.get(ip) ?? []).filter(t => now - t < WINDOW_MS)
  if (!hits.length) { ipLog.delete(ip); }
  if (hits.length >= RATE_LIMIT) return true
  ipLog.set(ip, [...hits, now])
  return false
}
```

**Pros:** Map stays bounded; simple  
**Cons:** None  
**Effort:** Small  
**Risk:** Low

### Option B — Leave as-is with comment
The existing comment already calls this out. Serverless cold starts reset the map frequently in practice.

**Pros:** Zero code change  
**Cons:** Technically unbounded; may matter in local dev or edge deployments  
**Effort:** None  
**Risk:** Low

## Recommended Action
_(leave blank — fill during triage)_

## Technical Details
- **Affected files:** `src/app/api/contact/route.js`, `src/app/api/unlock/route.js`
- **Key function:** `isRateLimited` in both files

## Acceptance Criteria
- [ ] `ipLog` entries are removed when their hit list has fully expired
- [ ] Rate-limit behaviour is unchanged for active IPs

## Work Log
- 2026-04-03: Identified during ce:review of commits c0edeb5–e273a3a
