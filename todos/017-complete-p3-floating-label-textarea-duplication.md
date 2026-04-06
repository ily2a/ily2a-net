---
status: pending
priority: p3
issue_id: "017"
tags: [code-review, quality]
dependencies: []
---

# FloatingLabelTextarea Duplicates Label Markup Instead of Reusing FloatingLabel

## Problem Statement
`FloatingLabelInput` and `FloatingLabelTextarea` are both in `src/components/FloatingLabelInput.js`. The file defines a `FloatingLabel` component to encapsulate the animated label logic, but `FloatingLabelTextarea` inlines its own label JSX instead of using `FloatingLabel`. This creates duplicated markup that could drift out of sync.

## Findings

- **File:** `src/components/FloatingLabelInput.js`
- `FloatingLabel` component: lines 60–71
- `FloatingLabelInput` correctly uses `<FloatingLabel>`: line 95
- `FloatingLabelTextarea` inlines identical label markup: lines 121–128 — bypasses `FloatingLabel` entirely

The inlined label differs only in the `top` position (`top-[22px]` vs `top-1/2`), which is the only reason it wasn't reused. This could be handled with a `topClass` prop on `FloatingLabel`.

## Proposed Solutions

### Option A: Add a `topClass` prop to `FloatingLabel`

```jsx
function FloatingLabel({ htmlFor, labelRef, floated, hasError, focused, children, topFloated = 'top-0', topResting = 'top-1/2' }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`absolute left-[14px] font-sans text-base leading-none pointer-events-none select-none origin-top-left transition-all duration-200
        ${floated ? `${topFloated} -translate-y-1/2 scale-[.8]` : `${topResting} -translate-y-1/2 scale-100`}
        ${hasError ? 'text-error' : focused ? 'text-brand' : 'text-text-secondary'}`}
    >
      <span ref={labelRef}>{children}</span>
    </label>
  )
}
```

Then `FloatingLabelTextarea` uses:
```jsx
<FloatingLabel ... topResting="top-[22px]">{label}</FloatingLabel>
```

**Pros:** Single source of truth, easy to maintain
**Effort:** Small
**Risk:** None — purely structural refactor, same output

### Option B: Leave as-is (acceptable)
The duplication is small (8 lines) and isolated. Not a functional issue.

## Acceptance Criteria
- [ ] Both input and textarea use the same `FloatingLabel` component for their labels

## Work Log
- 2026-04-06: Identified during full project review
