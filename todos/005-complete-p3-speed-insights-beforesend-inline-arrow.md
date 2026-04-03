---
status: pending
priority: p3
issue_id: "005"
tags: [code-review, quality, performance]
dependencies: []
---

# SpeedInsights beforeSend creates a new function reference on every render

## Problem Statement
`layout.js` passes an inline arrow function to `SpeedInsights`'s `beforeSend` prop:

```jsx
<SpeedInsights beforeSend={(event) => event.url.includes('/studio') ? null : event} />
```

Since `layout.js` is a Server Component, this renders once and the prop is stable in practice. However, if the layout ever becomes a Client Component (or in future Next.js versions with different rendering behaviour), the inline arrow will create a new function reference on every render, potentially causing `SpeedInsights` to re-register its listener on each re-render.

This is a low-severity hygiene issue — but the fix (hoisting the function to module scope) is one line.

## Findings
- `src/app/layout.js:78`: inline arrow in JSX prop

## Proposed Solutions

### Option A — Hoist to module-level constant (Recommended)
```js
const filterStudioEvents = (event) => event.url.includes('/studio') ? null : event
// ...
<SpeedInsights beforeSend={filterStudioEvents} />
```

**Pros:** Stable reference; more readable; consistent with SPRING_SNAP/animation constant hoisting pattern used across the codebase  
**Effort:** Trivial  
**Risk:** None

### Option B — Leave as-is
Server Component rendering means this is moot today.

**Pros:** No change needed right now  
**Cons:** Fragile if component boundary changes

## Recommended Action
_(leave blank — fill during triage)_

## Technical Details
- **Affected files:** `src/app/layout.js`
- **Line:** 78

## Acceptance Criteria
- [ ] `beforeSend` callback is a stable module-level reference

## Work Log
- 2026-04-03: Identified during ce:review of commit e273a3a
