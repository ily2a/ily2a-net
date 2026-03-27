---
status: complete
priority: p3
issue_id: "008"
tags: [code-review, quality]
dependencies: []
---

# Minor code cleanup — dead prop and duplicated PortableText config

## Problem Statement

Two small code quality issues found during review:

1. **`BookingButton` `compact` prop is accepted but never used** — the prop is destructured and appears in the component signature, suggesting it would affect layout, but no conditional logic references it anywhere. Any caller passing `compact` (e.g. `<BookingButton static compact />` in `ContactSection.js:231`) sees no effect.

2. **`ptBody` / `ptSection` in `CaseStudyPage` duplicate their `block.normal`, `list`, and `listItem` handlers** — the two Portable Text configs in `src/app/craft/[slug]/page.js` share identical renderers for these three keys. If the styling ever changes (e.g. the `text-md` class), it must be updated in two places.

## Findings

1. `src/components/BookingButton.js:32` — `compact = false` destructured; no `compact` reference anywhere in the component body
2. `src/app/craft/[slug]/page.js:66-152` — `ptBody.block.normal`, `ptBody.list`, `ptBody.listItem` are identical to `ptSection.block.normal`, `ptSection.list`, `ptSection.listItem`

## Proposed Solutions

### Issue 1 — Dead `compact` prop

**Option A (Recommended):** Remove `compact` from the destructuring, add the `compact` variant styling if it was intended, or document it as NYI.

**Option B:** Keep the prop but add a `// eslint-disable-next-line no-unused-vars` comment — only if the feature is planned.

### Issue 2 — PortableText duplication

**Option A (Recommended):** Extract the shared handlers into a `basePt` object and spread it into both configs:

```js
const basePt = {
  block: { normal: ... },
  list:  { bullet: ..., number: ... },
  listItem: { bullet: ..., number: ... },
}

const ptBody    = { ...basePt, types: { image: ... }, marks: { ... } }
const ptSection = { ...basePt, marks: { ... } }
```

**Option B:** Leave as-is and accept the duplication.

## Recommended Action

Both are clean-up items, ideal for a single small PR. Option A for both.

## Technical Details

- **Affected files**: `src/components/BookingButton.js`, `src/app/craft/[slug]/page.js`
- **No database changes, no behaviour changes**

## Acceptance Criteria

- [ ] `compact` prop is either implemented, removed, or explicitly marked as a planned feature
- [ ] `ptBody` and `ptSection` do not duplicate identical handler definitions

## Work Log

- 2026-03-28: Found during full project code review.

## Resources

- `src/components/BookingButton.js:32`
- `src/app/craft/[slug]/page.js:66-152`
