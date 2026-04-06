---
status: pending
priority: p1
issue_id: "001"
tags: [code-review, security]
dependencies: []
---

# Rotate Exposed API Keys in .env.local

## Problem Statement
The `.env.local` file contains live production secrets that were read during a code review session. The `RESEND_API_KEY` and `SANITY_API_READ_TOKEN` are real, active credentials sitting on disk. Anyone who reads this file (via screen share, remote access, or if the file were accidentally committed) has full access to send email as your domain and read all Sanity content including unpublished drafts.

## Findings

- **File:** `.env.local` lines 3–4
- `RESEND_API_KEY` — live Resend key (`re_WTyyQGX9_...`). Allows sending email, enumerating email lists, deleting API keys, exhausting send quota.
- `SANITY_API_READ_TOKEN` — long-lived Sanity read token. Can read all dataset content including drafts.
- The file is correctly listed in `.gitignore` and has NOT been committed to git history.
- `CASE_STUDY_PASSWORD` is absent from `.env.local` — confirm it is set in Vercel's environment variables panel or the password gate will always reject.

## Proposed Solutions

### Option A: Rotate both keys immediately (Recommended)
1. Go to [resend.com/api-keys](https://resend.com/api-keys) and revoke the current key, generate a new one
2. Go to Sanity Management → API → Tokens and revoke the current read token, generate a new one
3. Update `.env.local` with the new values
4. Update Vercel environment variables with the new values

**Pros:** Eliminates the exposure window
**Cons:** ~5 minutes of downtime if Live Content API token is rotated while app is running
**Effort:** Small
**Risk:** Low

### Option B: Do nothing (Not recommended)
Only acceptable if this machine has never been shared or accessed remotely and the file will never be committed.

## Recommended Action
Rotate both keys immediately via their respective dashboards.

## Technical Details
- **Affected files:** `.env.local`
- **Components:** Contact form (Resend), Live Content API (Sanity)

## Acceptance Criteria
- [ ] Old Resend API key is revoked
- [ ] New Resend API key is set in `.env.local` and Vercel
- [ ] Old Sanity read token is revoked
- [ ] New Sanity read token is set in `.env.local` and Vercel
- [ ] Contact form still sends email after rotation
- [ ] Live content updates still work after rotation
- [ ] `CASE_STUDY_PASSWORD` confirmed in Vercel environment variables

## Work Log
- 2026-03-31: Identified during code review by security agent
