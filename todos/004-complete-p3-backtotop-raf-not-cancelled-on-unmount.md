---
status: pending
priority: p3
issue_id: "004"
tags: [code-review, quality, performance]
dependencies: []
---

# BackToTop: pending RAF not cancelled on unmount

## Problem Statement
`BackToTop.js` introduced a `rafRef` to throttle `onMouseMove`, matching the pattern used in `SpotlightButton`. However, `SpotlightButton` added a cleanup `useEffect` that calls `cancelAnimationFrame(rafRef.current)` on unmount. `BackToTop` does not have this cleanup.

If the component unmounts while a RAF is pending (e.g. user scrolls up rapidly on a touch device and the button disappears mid-animation frame), the RAF callback will fire against an already-unmounted component. `ref.current` will be `null` so the crash is guarded, but the cancelled RAF is a small resource leak.

## Findings
- `BackToTop.js:8–35`: `rafRef` introduced, used correctly in `onMouseMove`
- No `useEffect(() => () => cancelAnimationFrame(rafRef.current), [])` present
- Compare: `SpotlightButton.js:18–22` has the exact cleanup pattern

## Proposed Solutions

### Option A — Add cleanup useEffect (Recommended)
Mirror `SpotlightButton`'s cleanup:
```js
useEffect(() => {
  return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
}, [])
```

**Pros:** Consistent with SpotlightButton; correct  
**Effort:** Trivial  
**Risk:** None

### Option B — Leave as-is
The `null` guard prevents crashes; the leak is tiny.

**Pros:** No change  
**Cons:** Inconsistency with SpotlightButton pattern  
**Effort:** None

## Recommended Action
_(leave blank — fill during triage)_

## Technical Details
- **Affected files:** `src/components/BackToTop.js`
- **Reference:** `src/components/SpotlightButton.js:18–22`

## Acceptance Criteria
- [ ] `BackToTop` cancels any pending RAF on unmount
- [ ] Pattern matches `SpotlightButton`

## Work Log
- 2026-04-03: Identified during ce:review of commits 8186138
