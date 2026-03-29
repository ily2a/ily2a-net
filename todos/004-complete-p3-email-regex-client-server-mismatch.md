---
status: pending
priority: p3
issue_id: "004"
tags: [code-review, quality, forms]
dependencies: []
---

# 004 · Email validation regex inconsistency between client and server

## Problem Statement

The contact form validates email on both the client and server, but uses slightly different regexes. The client is more permissive, meaning an email that passes client validation could be rejected by the server — showing the user a generic "Something went wrong" error instead of a clear validation message.

## Findings

- **Client** ([src/components/ContactSection.js:38](../src/components/ContactSection.js)): `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` — accepts TLDs of any length including 1 character (e.g. `x@y.z`).
- **Server** ([src/app/api/contact/route.js:6](../src/app/api/contact/route.js)): `/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i` — requires TLD of at least 2 characters.

An email like `x@y.z` passes client validation but fails server validation, triggering a 400 response that the client surfaces as "Something went wrong — please try again."

## Proposed Solutions

### Option A — Align client regex to match server (Recommended)
Update `ContactSection.js` to use the same regex as the server:

```js
email: !form.email.trim() || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(form.email),
```

**Pros:** User sees the client-side error message ("Please enter a valid email") before submitting.
**Cons:** None.
**Effort:** Trivial | **Risk:** None

### Option B — Move the regex to a shared constant
Export `EMAIL_RE` from a shared constants file and import it in both places.

**Pros:** Single source of truth, no future drift.
**Cons:** Slight over-engineering for a single regex.
**Effort:** Small | **Risk:** None

## Recommended Action

*(Leave blank — to be filled during triage)*

## Technical Details

- **Affected files:** `src/components/ContactSection.js` (line ~38)

## Acceptance Criteria

- [ ] Client and server email regex match
- [ ] A single-char TLD email shows "Please enter a valid email" on the client rather than a server error

## Work Log

- **2026-03-29** — Found during whole-project code review.

## Resources

- [ContactSection.js](../src/components/ContactSection.js)
- [src/app/api/contact/route.js](../src/app/api/contact/route.js)
