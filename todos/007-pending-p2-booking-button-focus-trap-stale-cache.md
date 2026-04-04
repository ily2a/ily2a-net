---
status: complete
priority: p2
issue_id: "007"
tags: [code-review, accessibility, quality]
dependencies: []
---

# BookingButton focus trap uses a stale element cache after iframe loads

## Problem Statement

`BookingButton` caches the list of focusable elements inside the modal in `focusableRef.current` using a single `querySelectorAll` call immediately after the modal opens (via `requestAnimationFrame`). The Cal.com iframe then loads asynchronously, which may render additional interactive elements inside the modal frame. The cached list is never updated to reflect those changes, so the focus trap can cycle incorrectly.

More critically: the `querySelectorAll` explicitly excludes iframes (comment: "Exclude iframes — the Cal.com iframe is sandboxed so keyboard focus cannot cycle within it"), but this means the `CloseButton` and any pre-iframe buttons are the only elements in the trap. If the iframe renders buttons accessible from the host frame, they are excluded. This is intentional but should be stable.

The actual bug: the cached `focusableRef` is built once at RAF, before `iframeLoaded` becomes `true`. After the iframe signals load via `onLoad`, the modal DOM doesn't change in a way that adds new host-frame focusable elements — so the cache is actually stable for the current use case. **However**, if a future change adds conditionally-rendered content inside the modal frame (e.g. a "success" state shown after booking), those elements would never enter the focus trap.

## Findings

- `src/components/BookingButton.js:84–95`: `focusableRef.current` is populated once in a `requestAnimationFrame` inside the `useEffect` that runs on `open` change.
- `src/components/BookingButton.js:97–110`: `handleKeyDown` reads from the static `focusableRef.current` — no re-query on DOM changes.
- `src/components/BookingButton.js:119–124`: `iframeLoaded` state triggers `setIframeLoaded(false)` on modal open but never triggers a re-cache of focusable elements.

## Proposed Solutions

### Option A — Re-query focusable elements on `iframeLoaded` (Recommended)
After `iframeLoaded` becomes `true`, update `focusableRef.current` with a fresh `querySelectorAll`. This ensures the trap is accurate after iframe signals it has loaded.

**Pros:** Accurate trap in all states; low risk  
**Cons:** Minor extra code  
**Effort:** Small  
**Risk:** Low

### Option B — Accept as stable for current implementation
Add a comment noting the cache is intentionally one-time because the modal frame DOM doesn't change after open. Document what would need updating if conditional content is added.

**Pros:** Zero code change  
**Cons:** Future trap for developers adding modal content  
**Effort:** Trivial  
**Risk:** Low

## Recommended Action

Option A — small fix, prevents future regression if modal content ever becomes dynamic.

## Technical Details

- Affected file: `src/components/BookingButton.js`
- Lines: 84–110 (focus trap setup) and the `iframeLoaded` effect at ~57–59

## Acceptance Criteria

- [ ] Focus trap element list is accurate after iframe signals load
- [ ] Keyboard Tab cycle visits all interactive elements in the modal host frame

## Work Log

- 2026-04-04: Identified during full-project code review

## Resources

- `src/components/BookingButton.js` — full modal + focus trap logic
