---
status: complete
priority: p3
issue_id: "013"
tags: [code-review, quality, architecture]
dependencies: []
---

# not-found.js: FloatingNav Not Wrapped in SilentErrorBoundary

## Problem Statement

`not-found.js` renders `FloatingNav` without a `SilentErrorBoundary` wrapper. If `FloatingNav` crashes (e.g. a GlassSurface SVG filter failure, a hook exception), the 404 page itself crashes and the user sees a blank page instead of a helpful not-found message. This is inconsistent with `page.js` (home), `craft/page.js` (once #005 is resolved), and `craft/[slug]/page.js` which all protect `FloatingNav` with `SilentErrorBoundary`.

The same applies to `error.js`.

## Findings

- **not-found.js:** [src/app/not-found.js:13](src/app/not-found.js#L13) — bare `<FloatingNav />`
- **error.js:** [src/app/error.js:9](src/app/error.js#L9) — bare `<FloatingNav />`
- **Comparison:** `src/app/page.js:28` — `<SilentErrorBoundary><FloatingNav ... /></SilentErrorBoundary>`

Note: `error.js` is a client component (required by Next.js error boundary convention), so `SilentErrorBoundary` works there too.

## Proposed Solutions

### Option A — Wrap in SilentErrorBoundary (Recommended)
Add `SilentErrorBoundary` import and wrap `FloatingNav` in both `not-found.js` and `error.js`.

**Pros:** Consistent; prevents cascade where a broken nav kills the error/404 UI
**Cons:** None
**Effort:** XSmall  **Risk:** None

## Recommended Action

_Pending triage_

## Technical Details

- **Affected files:** `src/app/not-found.js`, `src/app/error.js`

## Acceptance Criteria

- [ ] `FloatingNav` in `not-found.js` is wrapped in `SilentErrorBoundary`
- [ ] `FloatingNav` in `error.js` is wrapped in `SilentErrorBoundary`

## Work Log

- 2026-03-28: Identified during full project code review
