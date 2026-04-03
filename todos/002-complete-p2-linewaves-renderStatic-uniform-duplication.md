---
status: pending
priority: p2
issue_id: "002"
tags: [code-review, quality, performance]
dependencies: []
---

# LineWaves: renderStatic duplicates all uniform writes from the update loop

## Problem Statement
`renderStatic()` in `LineWaves.js` is a near-identical copy of the uniform-update block inside `update()`. Any future change to the uniform list (adding a new prop, renaming a key) must be made in two places — a maintenance hazard.

## Findings
- `LineWaves.js:265–294` (`renderStatic`): manually copies all 14 uniform assignments.
- `LineWaves.js:211–239` (`update`): the same 14 assignments already exist.
- The two blocks will silently diverge if a new prop is added.

## Proposed Solutions

### Option A — Extract `syncUniforms(cp)` helper (Recommended)
Pull the shared uniform-sync logic into a small inner function called by both `update` and `renderStatic`.

```js
const syncUniforms = (cp) => {
  program.uniforms.uSpeed.value = cp.speed
  // ... all other uniforms
}
```

**Pros:** Single source of truth; DRY; zero behaviour change  
**Cons:** None meaningful  
**Effort:** Small  
**Risk:** Low

### Option B — Live with the duplication
Leave as-is; add a comment pointing to the sister block.

**Pros:** Zero risk  
**Cons:** Maintenance burden grows  
**Effort:** None  
**Risk:** Low (now), Medium (later)

## Recommended Action
_(leave blank — fill during triage)_

## Technical Details
- **Affected files:** `src/components/LineWaves.js`
- **Key lines:** ~211–239 (update loop), ~265–294 (renderStatic)

## Acceptance Criteria
- [ ] Uniform sync logic exists in exactly one place
- [ ] `renderStatic` and `update` both call the shared helper
- [ ] Behaviour is identical to before

## Work Log
- 2026-04-03: Identified during ce:review of commits 8186138–e273a3a
