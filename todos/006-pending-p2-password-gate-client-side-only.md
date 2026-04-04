---
status: complete
priority: p2
issue_id: "006"
tags: [code-review, security, accessibility]
dependencies: []
---

# PasswordGate is a client-side overlay — protected content is in the DOM

## Problem Statement

`PasswordGate` renders a full-screen overlay that hides case study content until the correct password is entered. However, it operates purely as a visual cover: the page's SSR HTML — including the full case study text, body content, and metadata — is rendered into the DOM on the server and shipped to the browser before the gate renders.

Anyone can view the protected content by:
- Disabling JavaScript
- Using "View Page Source" or DevTools
- Fetching the URL with `curl`

This may be intentional for convenience (SEO, fast reveal), but if the intent is to genuinely restrict access, the current approach does not achieve it.

## Findings

- `src/app/craft/[slug]/page.js:100–105`: `{data.isPasswordProtected && <PasswordGate />}` renders the gate in JSX, but `data` (including all body content) is already fetched and embedded in the server render before `PasswordGate` mounts.
- `src/components/PasswordGate.js:17–19`: `useEffect` checks `sessionStorage` and sets `unlocked` — this is client-side only with no server-side auth.
- The Sanity GROQ query `CASE_STUDY_BY_SLUG_QUERY` returns the full document including `body`, `brief`, `problem`, `goals`, `uxStrategy` unconditionally — regardless of `isPasswordProtected`.

## Proposed Solutions

### Option A — Gate at the data layer (Recommended)
On the server in `getCaseStudy()`, check `isPasswordProtected`. If true, omit `body`, `brief`, `problem`, `goals`, `uxStrategy` from the returned data. Only return them after the user has authenticated via `/api/unlock` (e.g. set a cookie, then re-fetch client-side).

**Pros:** Content genuinely not in DOM until authenticated  
**Cons:** Requires client-side re-fetch after unlock; adds complexity  
**Effort:** Medium  
**Risk:** Low

### Option B — Accept as intentional, document the trade-off
If the gate is intended to be "soft security" (speed bumps, not real protection), add a comment explicitly documenting this so future maintainers don't assume it's secure.

**Pros:** Zero code change  
**Cons:** Protection is cosmetic  
**Effort:** Small (comment only)  
**Risk:** None

### Option C — Middleware-based auth cookie
Add a Next.js middleware that checks a signed cookie before serving the route. Set the cookie via `/api/unlock`. Redirect to the gate page if missing.

**Pros:** Full server-side protection  
**Cons:** Requires middleware + cookie logic; more moving parts  
**Effort:** Large  
**Risk:** Low but higher complexity

## Recommended Action

Decide on intent: if this is soft security (client portfolio, no real secrets), Option B is fine. If content is genuinely confidential, implement Option A minimum.

## Technical Details

- Affected files: `src/app/craft/[slug]/page.js`, `src/components/PasswordGate.js`, `src/lib/sanity-queries.js`
- No database changes needed for Option A/B
- Option C requires `middleware.js` at project root

## Acceptance Criteria

- [ ] Either: protected content is not present in server-rendered HTML for password-protected case studies
- [ ] Or: a code comment explicitly documents that this is intentional soft security, not server-enforced access control

## Work Log

- 2026-04-04: Identified during full-project code review

## Resources

- `src/app/craft/[slug]/page.js` — server component that fetches and renders all content
- `src/components/PasswordGate.js` — client-side overlay
- `src/lib/sanity-queries.js` — `CASE_STUDY_BY_SLUG_QUERY` returns full document
