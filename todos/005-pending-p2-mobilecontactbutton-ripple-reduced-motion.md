---
status: pending
priority: p2
issue_id: "005"
tags: [code-review, accessibility, animation]
dependencies: []
---

# MobileContactButton Ripple Missing prefers-reduced-motion Guard

## Problem Statement
The ripple animation on `MobileContactButton` runs unconditionally without checking `prefers-reduced-motion`. Additionally the Space key handler is missing `e.preventDefault()`, which may cause page scroll on some browsers when Space is pressed on the button.

## Findings

- **`src/components/MobileContactButton.js` lines 21–27** — `handleKeyDown` fires the ripple on Space but does not call `e.preventDefault()`. Native `<button>` elements suppress Space scroll but `motion.button` may not in all browsers.
- Ripple animation (`setRipple`, animated spread) has no guard for `prefers-reduced-motion`. Users with motion sensitivity still see the ripple expand.

## Proposed Solutions

### Option A: Guard ripple + add preventDefault
```js
const prefersReduced = usePrefersReducedMotion();

const triggerRipple = useCallback(() => {
  if (prefersReduced) return;
  // existing ripple logic
}, [prefersReduced]);

const handleKeyDown = (e) => {
  if (e.key === ' ') {
    e.preventDefault(); // prevent page scroll
    triggerRipple();
  }
};
```
**Effort:** Small
**Risk:** Low

### Option B: CSS-only reduced motion override
Add `@media (prefers-reduced-motion: reduce)` CSS rule to hide the ripple element.
**Pros:** No JS change needed
**Cons:** Inconsistent with how other components handle reduced motion (via JS hook)
**Effort:** Small
**Risk:** Low

## Recommended Action
Option A — consistent with the rest of the codebase.

## Technical Details
- **Affected files:** `src/components/MobileContactButton.js`
- **Reference:** `src/hooks/usePrefersReducedMotion.js`

## Acceptance Criteria
- [ ] Ripple does not animate when `prefers-reduced-motion: reduce`
- [ ] Space key on button does not scroll the page
- [ ] Button still works (opens contact form) in all cases

## Work Log
- 2026-03-31: Identified during accessibility review
