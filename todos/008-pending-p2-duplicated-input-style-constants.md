---
status: pending
priority: p2
issue_id: "008"
tags: [code-review, quality, architecture]
dependencies: []
---

# Duplicated Input Style Constants Across Components

## Problem Statement
`INPUT_RING`, `INPUT_RING_ERROR`, `FOCUS_RING`, `FOCUS_RING_ERROR`, and `INPUT_TRANSITION` are byte-for-byte identical in both `ContactSection.js` and `PasswordGate.js`. If the design token for the ring colour changes, it must be updated in two places.

## Findings

- **`src/components/ContactSection.js` lines 14–18** — defines all 5 constants
- **`src/components/PasswordGate.js` lines 11–15** — defines identical 5 constants

## Proposed Solutions

### Option A: Extract to src/constants/inputStyles.js (Recommended)
```js
// src/constants/inputStyles.js
export const INPUT_RING = '...';
export const INPUT_RING_ERROR = '...';
export const FOCUS_RING = '...';
export const FOCUS_RING_ERROR = '...';
export const INPUT_TRANSITION = '...';
```
Import in both components.

**Pros:** Single source of truth, consistent with existing constants pattern
**Effort:** Small
**Risk:** Low

### Option B: Define in globals.css as utility classes
Add named Tailwind utilities for the ring styles so they can be referenced by class name.
**Pros:** CSS-first approach consistent with the design system
**Cons:** Less explicit in component code
**Effort:** Small
**Risk:** Low

## Recommended Action
Option A — consistent with the existing `src/constants/` pattern.

## Technical Details
- **Affected files:** `src/components/ContactSection.js`, `src/components/PasswordGate.js`
- **New file:** `src/constants/inputStyles.js`

## Acceptance Criteria
- [ ] Constants defined once in `src/constants/inputStyles.js`
- [ ] Both components import from the shared module
- [ ] Visual appearance of both inputs is unchanged

## Work Log
- 2026-03-31: Identified during code quality review
