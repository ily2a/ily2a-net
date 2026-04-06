---
status: pending
priority: p3
issue_id: "016"
tags: [code-review, quality]
dependencies: []
---

# Remove Unused SPRING_CARD Export from animations.js

## Problem Statement
`SPRING_CARD` is exported from `src/constants/animations.js` but is never imported anywhere in the codebase. It was likely intended for `ProjectCard.js` (which has a `whileTap` scale effect) but that component uses an inline value instead.

## Findings

- **File:** `src/constants/animations.js:10`
- `export const SPRING_CARD = { type: 'spring', stiffness: 400, damping: 30 }` — zero imports found
- `ProjectCard.js` uses `whileTap={{ scale: 0.97 }}` with its own inline `transition={{ duration: 0.15, ease: 'easeOut' }}` — not using `SPRING_CARD`

## Proposed Solutions

### Option A: Delete the export
Remove line 5 (comment) and line 10 (the export) from `animations.js`.

**Pros:** Clean constants file with no dead exports
**Effort:** Small
**Risk:** None

### Option B: Wire it up
Use `SPRING_CARD` as the transition in `ProjectCard.js` `whileTap` for consistency.

**Pros:** Consistent animation config across the codebase
**Effort:** Small
**Risk:** Slight visual change to tap animation

## Recommended Action
Option A unless there's intent to unify tap animations.

## Acceptance Criteria
- [ ] `SPRING_CARD` is either removed or actively used in a component

## Work Log
- 2026-04-06: Identified during full project review
