---
name: BackToTop smooth scroll ignores prefers-reduced-motion
description: window.scrollTo({ behavior 'smooth' }) in BackToTop always animates, ignoring user motion preference
type: p2
status: pending
priority: p2
issue_id: "002"
tags: [code-review, accessibility]
---

## Problem Statement

`BackToTop.js` calls `window.scrollTo({ top: 0, behavior: 'smooth' })` unconditionally. Users who have set `prefers-reduced-motion: reduce` in their OS get an animated scroll even when they've explicitly requested no motion. This is a WCAG 2.3.3 compliance issue (Animation from Interactions, AAA) and a general accessibility concern.

## Findings

- [BackToTop.js:31](src/components/BackToTop.js) — `onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}`
- The project already correctly handles reduced motion everywhere else:
  - [MotionProvider.js:10](src/components/MotionProvider.js) — `reducedMotion="user"` covers Framer Motion
  - [GradientBlinds.js:350](src/components/GradientBlinds.js) — manual check for WebGL
  - [usePrefersReducedMotion.js](src/hooks/usePrefersReducedMotion.js) — hook available in the codebase

## Proposed Solutions

### Option A: Read `usePrefersReducedMotion` hook (Recommended)
The hook already exists in the project:
```js
const prefersReduced = usePrefersReducedMotion()
// ...
onClick={() => window.scrollTo({ top: 0, behavior: prefersReduced ? 'instant' : 'smooth' })}
```
**Pros:** Uses existing pattern, consistent with SmoothCursor which uses the same hook
**Effort:** Small | **Risk:** Low

### Option B: Inline `matchMedia` check
```js
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' })
```
**Pros:** No extra import
**Effort:** Small | **Risk:** Low

## Acceptance Criteria
- [ ] When `prefers-reduced-motion: reduce` is active, clicking Back to Top scrolls instantly (no animation)
- [ ] When no preference or `no-preference`, scroll animates smoothly as before

## Work Log
- 2026-03-30: Identified during full project code review
