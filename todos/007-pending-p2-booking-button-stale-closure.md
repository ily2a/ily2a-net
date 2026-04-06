---
status: pending
priority: p2
issue_id: "007"
tags: [code-review, quality]
dependencies: []
---

# BookingButton Stale Closure on handleClose

## Problem Statement
`BookingButton.js` has a stale closure bug where `handleClose` is defined outside the `useEffect` that captures it, but the effect only re-runs when `open` changes. The callbacks inside the effect close over a stale `handleClose` from the render when the modal was opened.

## Findings

- **`src/components/BookingButton.js` lines 114–116** — `handleKeyDown` and `handleCalMessage` are attached inside a `useEffect` but reference `handleClose` which is recreated each render and not included in the dependency array.
- In practice this is currently harmless because `handleClose` only calls `setOpen` and focuses `triggerRef` — both stable. But this becomes a real bug if `handleClose` ever gains a dependency on reactive state.

## Proposed Solutions

### Option A: Wrap handleClose in useCallback with proper deps
```js
const handleClose = useCallback(() => {
  setOpen(false);
  triggerRef.current?.focus();
}, []);
// handleClose is now stable, safe to include in effect deps
```
**Pros:** Correct pattern, future-proof
**Effort:** Small
**Risk:** Low

### Option B: Move handleClose definition inside the useEffect
Makes the closure explicit and correct by co-locating definition with use.
**Pros:** Zero risk of stale closure
**Cons:** Less reusable if handleClose is used elsewhere
**Effort:** Small
**Risk:** Low

## Recommended Action
Option A — `useCallback` with empty deps since the function only calls stable setters.

## Technical Details
- **Affected files:** `src/components/BookingButton.js`

## Acceptance Criteria
- [ ] `handleClose` is wrapped in `useCallback` or defined inside its effect
- [ ] No ESLint `react-hooks/exhaustive-deps` warning on this component
- [ ] Booking modal close behaviour unchanged

## Work Log
- 2026-03-31: Identified during code quality review
