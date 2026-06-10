import { describe, it, expect } from 'vitest'
import { EMAIL_RE, CONTACT_MAX } from '@/lib/validation'
import { CONTACT_MAX as MAX } from '@/lib/validation'

// EMAIL_RE is the single source of truth shared by the client (useContactForm)
// and the server (contact route). A drift here silently changes what either
// side accepts, so pin the contract.
describe('EMAIL_RE', () => {
  it.each([
    'a@b.co',
    'first.last@sub.domain.io',
    'USER@EXAMPLE.COM',     // case-insensitive
    'name+tag@example.org',
  ])('accepts %s', (addr) => {
    expect(EMAIL_RE.test(addr)).toBe(true)
  })

  it.each([
    'plainaddress',         // no @
    'a@b',                  // no TLD
    'a@b.c',                // 1-char TLD
    'a @b.com',             // space in local
    'a@ b.com',             // space in domain
    'a@@b.com',             // double @
    'a@b.com\n',            // trailing newline must fail (no /m, $ anchors end)
    'a@b.com extra',        // trailing junk
    '@b.com',               // empty local
    'a@.com',               // empty domain label before dot
  ])('rejects %s', (addr) => {
    expect(EMAIL_RE.test(addr)).toBe(false)
  })
})

describe('CONTACT_MAX', () => {
  it('exposes the exact caps the contact route imports', () => {
    // Guards against client/server drift — the route imports this same object.
    expect(CONTACT_MAX).toEqual({ name: 100, email: 254, message: 5000 })
    expect(MAX).toBe(CONTACT_MAX)
  })
})
