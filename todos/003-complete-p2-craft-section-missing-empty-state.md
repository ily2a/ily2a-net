---
status: complete
priority: p2
issue_id: "003"
tags: [code-review, quality, ux]
dependencies: []
---

# 003 · CraftSection has no empty state

## Problem Statement

`CraftSection` renders an empty grid when `projects` is an empty array — which happens when Sanity is unreachable or returns no data. Both `page.js` and `craft/page.js` catch fetch errors and pass an empty array to `CraftSection`. The result is a section with a heading and description but no cards and no user-facing explanation, which looks like a broken layout.

## Findings

- **Home page** ([src/app/page.js:16-18](../src/app/page.js)): catches Sanity errors and defaults to `projects = []`.
- **Craft page** ([src/app/craft/page.js:36-40](../src/app/craft/page.js)): same pattern.
- **CraftSection** ([src/components/CraftSection.js:36-40](../src/components/CraftSection.js)): renders `projects.map(...)` with no guard — an empty array produces an empty `<div class="grid ...">`.
- **Loading skeleton** exists ([src/app/loading.js](../src/app/loading.js)) for initial page load, but not for the empty-data case.

## Proposed Solutions

### Option A — Add a graceful empty state inside CraftSection (Recommended)
When `projects.length === 0`, render a subtle placeholder inside the grid:

```jsx
{projects.length === 0 ? (
  <p className="text-md text-text-secondary col-span-full py-8 text-center">
    Case studies coming soon.
  </p>
) : (
  projects.map((project) => <ProjectCard key={project._id} project={project} />)
)}
```

**Pros:** Handles both the "Sanity down" and "no content yet" cases gracefully.
**Cons:** Slightly masks fetch errors.
**Effort:** Small | **Risk:** Low

### Option B — Propagate error state and show a retry prompt
Pass an `error` prop from parent pages into `CraftSection`. Display a retry message with a reload button.

**Pros:** Transparent about the failure, gives user an action.
**Cons:** More plumbing; requires changing the page components.
**Effort:** Medium | **Risk:** Low

### Option C — Leave as-is
The section header remains visible; the empty grid is not catastrophically broken.

**Pros:** No change needed.
**Cons:** Empty grid looks like a layout bug on Sanity downtime or during initial setup.
**Effort:** None | **Risk:** None

## Recommended Action

*(Leave blank — to be filled during triage)*

## Technical Details

- **Affected files:** `src/components/CraftSection.js`, optionally `src/app/page.js`, `src/app/craft/page.js`

## Acceptance Criteria

- [ ] When `projects` is empty, a human-readable placeholder is shown instead of an empty grid
- [ ] On `/craft` with no data, the page does not look broken

## Work Log

- **2026-03-29** — Found during whole-project code review.

## Resources

- [CraftSection.js](../src/components/CraftSection.js)
- [src/app/page.js](../src/app/page.js)
- [src/app/craft/page.js](../src/app/craft/page.js)
