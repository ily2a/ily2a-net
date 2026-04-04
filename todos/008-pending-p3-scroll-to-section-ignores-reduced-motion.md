---
status: complete
priority: p3
issue_id: "008"
tags: [code-review, accessibility, motion]
dependencies: []
---

# ScrollToSection always uses smooth scroll, ignores prefers-reduced-motion

## Problem Statement

`ScrollToSection` handles the `?scrollTo=<section>` query param that drives cross-page navigation from the floating navbar. It always calls `scrollIntoView({ behavior: 'smooth' })`, regardless of whether the user has `prefers-reduced-motion: reduce` set in their OS accessibility settings.

`Navbar.js` already respects this preference for in-page scroll via `usePrefersReducedMotion()` (switching to `'instant'` when reduced motion is preferred). `ScrollToSection` is the cross-page path through the same nav — it should match the same behavior.

## Findings

- `src/components/ScrollToSection.js:18`: `el.scrollIntoView({ behavior: 'smooth' })` — no `prefers-reduced-motion` check.
- `src/components/Navbar.js:22–27`: `navTo()` correctly reads `prefersReduced` from `usePrefersReducedMotion()` and uses `'instant'` when true.
- The inconsistency means navigating to a section from another page (which goes through `ScrollToSection`) always animates, while navigating from within the home page respects the preference.

## Proposed Solutions

### Option A — Add usePrefersReducedMotion hook (Recommended)
Import `usePrefersReducedMotion` and pass `behavior: prefersReduced ? 'instant' : 'smooth'` to `scrollIntoView`.

**Pros:** Consistent with `Navbar` behavior; correct a11y  
**Cons:** Adds a hook call  
**Effort:** Small  
**Risk:** None

### Option B — Use CSS `scroll-behavior: auto` override via media query
Not applicable here — `scrollIntoView` is a JS call, not CSS-driven.

## Recommended Action

Option A.

## Technical Details

- Affected file: `src/components/ScrollToSection.js:18`
- Import: `usePrefersReducedMotion` from `@/hooks/usePrefersReducedMotion`

## Acceptance Criteria

- [ ] When `prefers-reduced-motion: reduce` is active, cross-page section scroll is instant (not animated)
- [ ] Behavior matches `Navbar.js` in-page scroll

## Work Log

- 2026-04-04: Identified during full-project code review

## Resources

- `src/components/ScrollToSection.js` — the file to fix
- `src/components/Navbar.js:22–27` — reference implementation using `usePrefersReducedMotion`
