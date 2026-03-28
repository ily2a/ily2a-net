---
status: pending
priority: p2
issue_id: "002"
tags: [code-review, accessibility]
dependencies: []
---

# TOC Active Item Missing aria-current

## Problem Statement

The `TableOfContents` component highlights the active section visually (brand colour + border), but conveys no accessible state change. Screen reader users navigating with a keyboard cannot tell which section is currently in view. This is a WCAG 2.1 AA concern under Success Criterion 1.3.1 (Info and Relationships).

## Findings

- **Location:** [src/components/TableOfContents.js:39-50](src/components/TableOfContents.js#L39-L50) — anchor elements have no `aria-current` attribute
- The only signal is CSS class changes (`text-text-primary border-brand` vs secondary colours)
- The `<nav aria-label="On this page">` wrapper is correctly labelled — just the active item is missing its semantic state

## Proposed Solutions

### Option A — Add aria-current="true" to the active link (Recommended)
```jsx
<a
  href={`#${id}`}
  aria-current={activeId === id ? 'true' : undefined}
  ...
>
```
Using `"true"` rather than `"location"` because `"location"` is reserved for the current page in a nav, not the current section position.

**Pros:** Correct WCAG pattern; one-line change
**Cons:** None
**Effort:** Small  **Risk:** None

### Option B — aria-current="location"
Use the `"location"` value as it semantically means "the current page within a set of pages or the current item within a set of items".

**Pros:** Arguably more semantically precise for in-page navigation
**Cons:** Some screen readers announce it differently; `"true"` is safer and widely used
**Effort:** Small  **Risk:** Very low

## Recommended Action

_Pending triage_

## Technical Details

- **Affected files:** `src/components/TableOfContents.js`

## Acceptance Criteria

- [ ] Active TOC link has `aria-current="true"` when its section is in view
- [ ] Attribute is removed (or `undefined`) when the section is not active
- [ ] Screen reader announces the active item appropriately

## Work Log

- 2026-03-28: Identified during code review of commit 0027975
