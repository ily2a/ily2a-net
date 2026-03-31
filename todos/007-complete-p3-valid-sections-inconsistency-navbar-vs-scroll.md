---
name: VALID_SECTIONS inconsistency between Navbar and ScrollToSection
description: Navbar.js does not include 'testimonials' in VALID_SECTIONS while ScrollToSection.js does — minor mismatch
type: p3
status: pending
priority: p3
issue_id: "007"
tags: [code-review, quality]
---

## Problem Statement

Two separate `VALID_SECTIONS` sets are defined:

- [Navbar.js:15](src/components/Navbar.js): `new Set(['hero', 'work', 'capabilities', 'contact'])` — no `testimonials`
- [ScrollToSection.js:6](src/components/ScrollToSection.js): `new Set(['hero', 'work', 'capabilities', 'testimonials', 'contact'])` — includes `testimonials`

This means `/?scrollTo=testimonials` works via deep-link but there's no way to navigate there from the navbar. This may be intentional (testimonials section exists but has no nav button), but the inconsistency could confuse future maintainers or cause the `testimonials` deep-link to break if someone "fixes" Navbar by syncing the sets.

## Proposed Solutions

### Option A: Centralise VALID_SECTIONS in a constant (Recommended)
```js
// src/constants/layout.js or site.js
export const NAV_SECTIONS = ['hero', 'work', 'capabilities', 'contact']
export const ALL_SECTIONS = [...NAV_SECTIONS, 'testimonials']
```
Use `NAV_SECTIONS` in Navbar and `ALL_SECTIONS` in ScrollToSection. Makes the intentional difference explicit.
**Effort:** Small | **Risk:** Low

### Option B: Add a comment on each file explaining the intentional difference
**Effort:** Trivial | **Risk:** Low

## Acceptance Criteria
- [ ] The relationship between NAV_SECTIONS and ALL_SECTIONS is explicit and documented
- [ ] No accidental sync that breaks `?scrollTo=testimonials` deep-link

## Work Log
- 2026-03-30: Identified during full project code review
