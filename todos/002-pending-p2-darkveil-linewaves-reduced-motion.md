---
status: pending
priority: p2
issue_id: "002"
tags: [code-review, accessibility, animation]
dependencies: []
---

# DarkVeil and LineWaves Missing prefers-reduced-motion Guard

## Problem Statement
`DarkVeil.js` and `LineWaves.js` both run continuous WebGL/canvas animation loops unconditionally — they do not check `prefers-reduced-motion`. All other animation components (`Aurora.js`, `GradientBlinds.js`) check `window.matchMedia('(prefers-reduced-motion: reduce)')` and render a static frame when true. This is an inconsistency that violates the accessibility contract for users with vestibular disorders.

## Findings

- **`src/components/DarkVeil.js`** — animation loop calls `loop()` unconditionally. No `matchMedia` check. No static-frame fallback. Canvas also missing `aria-hidden="true"` (covered in separate finding).
- **`src/components/LineWaves.js`** — `useEffect` starts the animation loop unconditionally. No `matchMedia` check. `LineWavesBackground.js` wraps it without adding any guard.
- `Aurora.js` is the reference implementation: checks `window.matchMedia('(prefers-reduced-motion: reduce)')` and stops the animation loop when true.

## Proposed Solutions

### Option A: Follow Aurora.js pattern (Recommended)
In both components, add a `matchMedia` check inside `useEffect`:
```js
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReduced) {
  // render single static frame and return
  renderer.render({ scene, camera });
  return;
}
// ...start animation loop
```
Also add `aria-hidden="true"` to the DarkVeil `<canvas>`.

**Pros:** Consistent with existing animation components
**Effort:** Small
**Risk:** Low

### Option B: Use `usePrefersReducedMotion` hook
The codebase already has `src/hooks/usePrefersReducedMotion.js`. Import and use it to conditionally skip the loop.

**Pros:** Reactive (responds to OS preference change at runtime)
**Cons:** Hook introduces a render cycle; OGL animation init should still happen inside effect
**Effort:** Small
**Risk:** Low

## Recommended Action
Option A — follow the existing Aurora.js pattern for consistency.

## Technical Details
- **Affected files:** `src/components/DarkVeil.js`, `src/components/LineWaves.js`, `src/components/LineWavesBackground.js`

## Acceptance Criteria
- [ ] DarkVeil animation loop does not run when `prefers-reduced-motion: reduce`
- [ ] LineWaves animation loop does not run when `prefers-reduced-motion: reduce`
- [ ] A static frame is shown in both cases (not a blank canvas)
- [ ] DarkVeil `<canvas>` has `aria-hidden="true"`
- [ ] Pattern is consistent with Aurora.js implementation

## Work Log
- 2026-03-31: Identified during accessibility review
