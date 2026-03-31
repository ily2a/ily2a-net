---
name: Aurora missing prefers-reduced-motion and visibilitychange pause
description: Aurora WebGL animation runs unconditionally — ignores prefers-reduced-motion and doesn't pause when the tab is hidden
type: p2
status: pending
priority: p2
issue_id: "001"
tags: [code-review, accessibility, performance]
---

## Problem Statement

`Aurora.js` runs a continuous WebGL RAF loop with no accessibility or performance guards:

1. **No `prefers-reduced-motion` check** — unlike `GradientBlinds.js` which renders a single static frame then stops when `(prefers-reduced-motion: reduce)` is set, Aurora keeps animating regardless. This contradicts the `MotionProvider` intent (which only covers Framer Motion, not raw WebGL).

2. **No `visibilitychange` pause** — `GradientBlinds` adds a `document.visibilitychange` listener to cancel the RAF when the tab is hidden. Aurora only uses `IntersectionObserver` (good for scroll-based pause) but not visibility — so the GPU keeps rendering even when the user switches tabs.

## Findings

- [Aurora.js:123-208](src/components/Aurora.js) — `useEffect` sets up the RAF loop, no `prefers-reduced-motion` check before starting
- [Aurora.js:173-180](src/components/Aurora.js) — `IntersectionObserver` handles scroll-out-of-view, but no `document.addEventListener('visibilitychange', ...)`
- [GradientBlinds.js:350-356](src/components/GradientBlinds.js) — reference implementation: checks reduced motion, renders one frame, stops
- [GradientBlinds.js:289-299](src/components/GradientBlinds.js) — reference implementation: `visibilitychange` listener + `setActive` helper

## Proposed Solutions

### Option A: Mirror GradientBlinds pattern (Recommended)
Add reduced-motion check after setup and add visibilitychange listener:
```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (prefersReducedMotion) {
  renderer.render({ scene: mesh })
  // don't start RAF
} else {
  animateId = requestAnimationFrame(update)
}
const onVisibility = () => {
  if (document.hidden) { cancelAnimationFrame(animateId); animateId = 0 }
  else if (!animateId) { animateId = requestAnimationFrame(update) }
}
document.addEventListener('visibilitychange', onVisibility)
// cleanup: document.removeEventListener('visibilitychange', onVisibility)
```
**Pros:** Consistent with GradientBlinds, respects accessibility, saves GPU
**Effort:** Small | **Risk:** Low

### Option B: Use a ref for reduced-motion (live-update)
Listen to the media query change event to also react if user changes their OS setting during the session.
**Pros:** More reactive
**Effort:** Small | **Risk:** Low

## Acceptance Criteria
- [ ] Aurora does not start the animation loop when `prefers-reduced-motion: reduce` is set
- [ ] Aurora renders one static frame in reduced-motion mode (same as GradientBlinds)
- [ ] Aurora pauses the RAF when `document.hidden === true`
- [ ] Aurora resumes the RAF when the tab becomes visible again
- [ ] Cleanup removes the `visibilitychange` listener

## Work Log
- 2026-03-30: Identified during full project code review
