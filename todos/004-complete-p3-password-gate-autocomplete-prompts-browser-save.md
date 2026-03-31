---
name: PasswordGate autocomplete prompts browser to save portfolio password as credential
description: autocomplete="current-password" causes browsers to offer saving the portfolio password as a real account credential
type: p3
status: pending
priority: p3
issue_id: "004"
tags: [code-review, ux]
---

## Problem Statement

[PasswordGate.js:90](src/components/PasswordGate.js) sets `autoComplete="current-password"` on the password input. This signals to browsers and password managers that this is a real account login, causing them to offer to save the password. A visitor entering their portfolio-access password gets a "Save password for ily2a.net?" prompt, which is confusing UX — this isn't their account password.

## Findings

- [PasswordGate.js:90](src/components/PasswordGate.js) — `autoComplete="current-password"`

## Proposed Solutions

### Option A: Use `autocomplete="off"` (Recommended)
```jsx
autoComplete="off"
```
Tells the browser not to autocomplete or offer to save this field.
**Effort:** Trivial | **Risk:** None

### Option B: Use `autocomplete="new-password"`
Prevents saving while still allowing browser to generate a password suggestion (unlikely to trigger here but technically more correct for "not a login").
**Effort:** Trivial | **Risk:** None

## Acceptance Criteria
- [ ] Browsers do not prompt to save the entered value as a credential
- [ ] Password managers do not autofill this field with stored credentials

## Work Log
- 2026-03-30: Identified during full project code review
