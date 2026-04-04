---
status: complete
priority: p3
issue_id: "009"
tags: [code-review, quality, dx]
dependencies: []
---

# useHeroIntroPlayed module-level flag persists across HMR in dev, hides animation bugs

## Problem Statement

`useHeroIntroPlayed` uses a module-level `_played` flag to avoid `sessionStorage` reads on re-mount (e.g. client-side navigation). This is correct for production. However, in development with HMR, module-level variables are **not** reset between hot reloads — only React state is. The `_played` flag survives HMR, so after the first page load the hero animations never replay during development, even when the developer hasn't navigated away. This makes it hard to iterate on entrance animation timing.

This is a DX issue, not a runtime bug — production behavior is unaffected.

## Findings

- `src/hooks/useHeroIntroPlayed.js:5`: `let _played = false` — module-level, survives HMR.
- `src/hooks/useHeroIntroPlayed.js:9–17`: The `useEffect` checks `_played` first and returns early if true, bypassing `sessionStorage`. After the first render in a dev session, every HMR reload skips the `sessionStorage` check and sees `_played = true`.
- In production this works correctly because module state is per-request on the server and per-page-load on the client (no HMR).

## Proposed Solutions

### Option A — Guard behind `process.env.NODE_ENV !== 'production'`
In development, skip the module-level cache and always rely on `sessionStorage`. In production, keep the current fast-path.

```js
// Only use module cache in production — HMR resets React state but not module vars
const useModuleCache = process.env.NODE_ENV === 'production'
```

**Pros:** Animations replay correctly on HMR save in dev  
**Cons:** Tiny conditional; sessionStorage read on every HMR in dev (negligible)  
**Effort:** Small  
**Risk:** None

### Option B — Accept as-is, document the behavior
Add a comment explaining the HMR limitation.

**Pros:** Zero code change  
**Cons:** Confusing for future developers iterating on animation timing  
**Effort:** Trivial  
**Risk:** None

## Recommended Action

Option A is low-effort and meaningfully improves DX for animation work. Option B is acceptable if animation iteration isn't frequent.

## Technical Details

- Affected file: `src/hooks/useHeroIntroPlayed.js`

## Acceptance Criteria

- [ ] In development, hero animations replay after HMR save when `sessionStorage` key is cleared
- [ ] In production, behavior is unchanged (module-level cache still prevents re-animation on navigation)

## Work Log

- 2026-04-04: Identified during full-project code review

## Resources

- `src/hooks/useHeroIntroPlayed.js` — the file to fix
