---
status: pending
priority: p2
issue_id: "003"
tags: [code-review, accessibility, animation]
dependencies: []
---

# scrollIntoView smooth Ignores prefers-reduced-motion

## Problem Statement
`TestimonialsButton.js` and `Navbar.js` hardcode `behavior: 'smooth'` in `scrollIntoView()` calls without checking `prefers-reduced-motion`. `BackToTop.js` correctly reads the preference and switches to `'instant'` — the same pattern needs to be applied consistently.

## Findings

- **`src/components/TestimonialsButton.js` line 27:** `document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })`
- **`src/components/Navbar.js` line 22:** `element.scrollIntoView({ behavior: 'smooth' })`
- **`src/components/BackToTop.js`** — correct reference implementation: uses `usePrefersReducedMotion` hook and switches to `'instant'` when true.

## Proposed Solutions

### Option A: Use usePrefersReducedMotion hook (Recommended)
```js
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
// in component:
const prefersReduced = usePrefersReducedMotion();
// in handler:
element.scrollIntoView({ behavior: prefersReduced ? 'instant' : 'smooth' });
```

**Pros:** Consistent with BackToTop, reactive to OS changes
**Effort:** Small
**Risk:** Low

### Option B: Inline matchMedia check
```js
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
element.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
```
**Pros:** No extra hook import for Navbar
**Cons:** Not reactive to preference changes during session
**Effort:** Small
**Risk:** Low

## Recommended Action
Option A for TestimonialsButton (already a client component with hooks). Option A or B for Navbar.

## Technical Details
- **Affected files:** `src/components/TestimonialsButton.js`, `src/components/Navbar.js`
- **Reference:** `src/components/BackToTop.js`, `src/hooks/usePrefersReducedMotion.js`

## Acceptance Criteria
- [ ] TestimonialsButton scroll is instant when `prefers-reduced-motion: reduce`
- [ ] Navbar section scroll is instant when `prefers-reduced-motion: reduce`
- [ ] Behaviour unchanged for users without motion preference

## Work Log
- 2026-03-31: Identified during accessibility review
