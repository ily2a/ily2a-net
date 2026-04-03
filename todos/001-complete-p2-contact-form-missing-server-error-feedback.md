---
status: pending
priority: p2
issue_id: "001"
tags: [code-review, quality, accessibility]
dependencies: []
---

# Contact form generic error gives no user guidance

## Problem Statement
When the contact API returns a non-429, non-2xx response, the frontend catches the error and sets `status = 'error'`, which renders a generic error message. But when `res.ok` is false for a 400-level validation error (e.g. `'Input too long'`, `'Invalid email'`), the actual server error message is thrown away. The user sees a vague "Something went wrong" instead of what was wrong.

Additionally, the `error` status is never cleared when the user starts typing again — only `errors` (field validation) is cleared on `handleChange`, not `status`. So after a server-side rejection the "Something went wrong" banner stays even after the user corrects their input.

## Findings
- `ContactSection.js:57–62`: `if (!res.ok) throw new Error()` discards the JSON body from 400 responses.
- `ContactSection.js:34`: `handleChange` clears `errors[name]` but never resets `status` to `'idle'`.
- If a 400 comes back (e.g. "Input too long"), the error banner persists even when the user starts editing.

## Proposed Solutions

### Option A — Read and surface API error body (Recommended)
Parse `res.json()` on failure and set a `serverError` string shown in the banner. On any `handleChange`, also reset `status` to `'idle'`.

**Pros:** Precise feedback; clears stale banner on re-edit  
**Cons:** Minor extra code  
**Effort:** Small  
**Risk:** Low

### Option B — Reset status on handleChange only
Don't change server error wording; just clear the banner when the user starts re-typing.

**Pros:** Trivial change  
**Cons:** Still shows a vague error  
**Effort:** Small  
**Risk:** Low

## Recommended Action
_(leave blank — fill during triage)_

## Technical Details
- **Affected files:** `src/components/ContactSection.js`
- **Key lines:** 34 (`handleChange`), 57–62 (fetch error handling)

## Acceptance Criteria
- [ ] After a server error, editing any field clears the error banner
- [ ] 400-level errors with a descriptive server message are surfaced to the user (or a clear generic fallback is shown)

## Work Log
- 2026-04-03: Identified during ce:review of commits c0edeb5–e273a3a
