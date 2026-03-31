---
name: Email validation regex duplicated between ContactSection and API route
description: The EMAIL_RE regex is defined independently in ContactSection.js and contact/route.js — risk of divergence
type: p3
status: pending
priority: p3
issue_id: "005"
tags: [code-review, quality]
---

## Problem Statement

The email validation regex `/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i` is independently defined in two files:
- [ContactSection.js:41](src/components/ContactSection.js) — client-side validation
- [contact/route.js:5](src/app/api/contact/route.js) — server-side validation as `const EMAIL_RE`

If one is updated to fix a validation edge case (e.g. supporting new TLDs, handling quoted strings, adding IDN support), the other may lag behind, causing inconsistent UX where the form passes client validation but fails server-side (or vice versa).

## Findings

- [ContactSection.js:41](src/components/ContactSection.js) — inline regex in `validate()`
- [contact/route.js:5](src/app/api/contact/route.js) — `const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i`

## Proposed Solutions

### Option A: Extract to a shared lib utility (Recommended)
Create `src/lib/validation.js`:
```js
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
```
Import in both places. Single source of truth.
**Effort:** Small | **Risk:** Low

### Option B: Leave as-is with a comment
Add a comment on each occurrence referencing the other, so changes are made together.
**Effort:** Trivial | **Risk:** Low (relies on discipline)

## Acceptance Criteria
- [ ] Email regex defined in exactly one place
- [ ] Both ContactSection.js and contact/route.js use the shared constant

## Work Log
- 2026-03-30: Identified during full project code review
