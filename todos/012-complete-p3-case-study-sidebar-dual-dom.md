---
status: complete
priority: p3
issue_id: "012"
tags: [code-review, performance, quality]
dependencies: []
---

# Case Study Page: SidebarContent Rendered Twice in DOM (Mobile + Desktop)

## Problem Statement

`SidebarContent` (project meta fields + tags) is rendered twice in the case study page — once for mobile (`block lg:hidden`) and once for the desktop sidebar (`hidden lg:flex`). Both are always in the DOM; only one is visible at a time via CSS. This is the same pattern as the dual-card issue in CraftSection (see #006) — it doubles DOM nodes and any rendering work associated with them.

For the sidebar this is less impactful than images (it's just text/tags), but it's still unnecessarily duplicated HTML and causes duplicate element IDs if any sidebar content ever gains an `id` attribute.

## Findings

- **Mobile sidebar:** [src/app/craft/[slug]/page.js:285-287](src/app/craft/%5Bslug%5D/page.js#L285-L287)
  ```jsx
  <div className="block lg:hidden">
    <SidebarContent metaFields={metaFields} tags={data.tags} />
  </div>
  ```
- **Desktop sidebar:** [src/app/craft/[slug]/page.js:332](src/app/craft/%5Bslug%5D/page.js#L332)
  ```jsx
  <SidebarContent metaFields={metaFields} tags={data.tags} />
  ```

## Proposed Solutions

### Option A — CSS-only responsive positioning (Recommended)
Render `SidebarContent` once and use CSS to position it differently at different breakpoints (e.g. inside the content column on mobile, in the sidebar on desktop via CSS order or absolute/sticky positioning).

**Pros:** Single DOM instance; correct
**Cons:** More complex CSS to achieve the two-position layout
**Effort:** Small  **Risk:** Low

### Option B — Accept the duplication
The content is lightweight (text only), so the real-world impact is negligible. Leave as-is, add a comment explaining the intentional duplication.

**Pros:** Zero change
**Cons:** Perpetuates the pattern; slight DOM bloat
**Effort:** None  **Risk:** None

## Recommended Action

_Pending triage_

## Technical Details

- **Affected file:** `src/app/craft/[slug]/page.js`
- **Related issue:** #006 — same CSS-show/hide-both-in-DOM pattern

## Acceptance Criteria

- [ ] `SidebarContent` is present once in the rendered DOM
- [ ] Sidebar appears inline on mobile, sticky in the right column on desktop

## Work Log

- 2026-03-28: Identified during full project code review
