---
status: pending
priority: p3
issue_id: "012"
tags: [code-review, quality]
dependencies: []
---

# CVA with No Variants in ContactFormButton is Unnecessary

## Problem Statement
`ContactFormButton.js` imports and uses `class-variance-authority` (CVA) with empty `variants: {}` and `defaultVariants: {}`. There is only one visual style and no planned variants. This adds a dependency import for zero benefit.

## Findings

- **`src/components/ContactFormButton.js` lines 8–21** — CVA configured with empty variants. The rest of the codebase uses `cn()` (clsx + tailwind-merge) directly for class composition.
- `class-variance-authority` is a separate package used only by this one file.

## Proposed Solutions

### Option A: Replace CVA with cn() (Recommended)
```js
import { cn } from '@/lib/utils';
// Replace: const buttonVariants = cva(baseClasses, { variants: {}, defaultVariants: {} })
// With: const classes = cn(baseClasses, className)
```
**Pros:** Removes unnecessary abstraction, consistent with rest of codebase
**Effort:** Small
**Risk:** Low

### Option B: Keep CVA for future variants
If button variants are planned (e.g. size, color), CVA setup is justified.
**Cons:** Premature abstraction if no variants are planned

## Recommended Action
Option A unless button variants are actively planned.

## Technical Details
- **Affected files:** `src/components/ContactFormButton.js`

## Acceptance Criteria
- [ ] CVA import removed from ContactFormButton.js
- [ ] Class composition uses `cn()` directly
- [ ] Visual appearance of button unchanged
- [ ] Check if `class-variance-authority` is used elsewhere before removing from package.json

## Work Log
- 2026-03-31: Identified during code quality review
