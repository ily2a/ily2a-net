---
status: pending
priority: p3
issue_id: "013"
tags: [code-review, quality]
dependencies: []
---

# SpotlightButton RAF Not Cancelled on Unmount

## Problem Statement
`SpotlightButton.js` starts a requestAnimationFrame loop on `onMouseMove` but has no `useEffect` cleanup to cancel the pending frame on unmount. This is inconsistent with `BackToTop.js` and `SmoothCursor.js` which both cancel their RAF on cleanup.

## Findings

- **`src/components/SpotlightButton.js` lines 21–30** — `rafRef.current` is set but never cancelled in a cleanup function. If the button unmounts while a frame is pending (e.g. a modal closes mid-mouse-movement), the frame fires against a null ref — safe because of `?.` but leaks a frame.
- **`src/components/BackToTop.js`** and **`src/components/SmoothCursor.js`** — both have `return () => cancelAnimationFrame(rafRef.current)` in their `useEffect` cleanup.

## Proposed Solutions

### Option A: Add cleanup to the event handler effect
```js
useEffect(() => {
  return () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };
}, []);
```
**Effort:** Tiny
**Risk:** None

## Recommended Action
Option A. Two-line fix.

## Technical Details
- **Affected files:** `src/components/SpotlightButton.js`
- **Reference:** `src/components/BackToTop.js` cleanup pattern

## Acceptance Criteria
- [ ] `cancelAnimationFrame(rafRef.current)` called on unmount
- [ ] No regressions in spotlight hover effect

## Work Log
- 2026-03-31: Identified during code quality review
