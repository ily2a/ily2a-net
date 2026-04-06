---
status: pending
priority: p2
issue_id: "015"
tags: [code-review, quality]
dependencies: []
---

# Remove Orphaned clsx and tailwind-merge Dependencies

## Problem Statement
During this session's dead code cleanup, `src/lib/utils.js` was deleted because it exported a `cn()` utility that was never used anywhere. However, `clsx` and `tailwind-merge` — the two packages it depended on — are still listed in `package.json`. They now have zero consumers in the codebase and should be removed to keep the dependency tree clean.

## Findings

- **File:** `package.json`
- `"clsx": "^2.1.1"` — no imports found anywhere in `src/`
- `"tailwind-merge": "^3.5.0"` — no imports found anywhere in `src/`
- The only consumer was `src/lib/utils.js` which was deleted

## Proposed Solutions

### Option A: Remove both packages (Recommended)

```bash
npm uninstall clsx tailwind-merge
```

This removes them from `package.json` and `package-lock.json`.

**Pros:** Clean dependency tree, smaller install, no stale entries
**Cons:** None — they have no consumers
**Effort:** Small
**Risk:** None

## Acceptance Criteria
- [ ] `clsx` and `tailwind-merge` are absent from `package.json` dependencies
- [ ] `npm install` runs cleanly after removal
- [ ] No build errors

## Work Log
- 2026-04-06: Identified during full project review — orphaned by deletion of `utils.js`
