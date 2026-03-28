---
status: complete
priority: p3
issue_id: "008"
tags: [code-review, performance, quality]
dependencies: []
---

# GlassSurface: VALID_BLEND_MODES Set Recreated on Every Render

## Problem Statement

`GlassSurface.js` defines `VALID_BLEND_MODES` as a `new Set([...])` inside the component function body. This means a new Set object is created on every render. Since multiple `GlassSurface` instances exist on the page (at minimum one per nav bar), this creates unnecessary garbage on every re-render.

## Findings

- **Location:** [src/components/GlassSurface.js:70-75](src/components/GlassSurface.js#L70-L75)
  ```js
  const VALID_BLEND_MODES = new Set([
    'normal','multiply','screen','overlay','darken','lighten',
    ...
  ])
  const safeBlendMode = VALID_BLEND_MODES.has(mixBlendMode) ? mixBlendMode : 'normal'
  ```
- The constant never changes and does not depend on props or state — it should live at module level

## Proposed Solutions

### Option A — Hoist to module level (Recommended)
Move `VALID_BLEND_MODES` outside the component function, to module scope (before the component declaration).

**Pros:** Created once; shared across all instances; zero behaviour change
**Cons:** None
**Effort:** XSmall  **Risk:** None

## Recommended Action

_Pending triage_

## Technical Details

- **Affected file:** `src/components/GlassSurface.js`

## Acceptance Criteria

- [ ] `VALID_BLEND_MODES` is defined at module scope, not inside the component body

## Work Log

- 2026-03-28: Identified during full project code review
