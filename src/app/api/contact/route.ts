import { Resend } from 'resend'
import { EMAIL_RE, CONTACT_MAX as MAX } from '@/lib/validation'
import { getClientIp, createRateLimiter } from '@/lib/api'
import { contactDedup } from '@/lib/dedup'

const resend = new Resend(process.env.RESEND_API_KEY)

// 5 requests per IP per hour. See lib/api.ts for caveats around per-instance state.
const isRateLimited = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 })

// Hard cap on raw POST body (in characters). Cuts off oversized payloads
// before JSON.parse allocates them.
const MAX_BODY_CHARS = 16_000

// Strip ASCII + Unicode line/header terminators that could break out of a
// MIME header when interpolated into the email subject. Covers NUL, CR, LF,
// TAB, NEL (U+0085), VT (U+000B), FF (U+000C), LINE SEP (U+2028), PARA SEP
// (U+2029). NUL is included because lenient SMTP implementations may treat a
// null octet as an implicit line break even though RFC 5321 forbids it.
const HEADER_BREAKERS = /[ \r\n\t\u0085\u000B\u000C\u2028\u2029]/g

export async function POST(request: Request) {
  if (isRateLimited(getClientIp(request))) {
    return Response.json({ error: 'Too many requests' }, { status: 429 })
  }

  // Read as text first so we can size-cap before JSON.parse allocates.
  let raw: string
  try {
    raw = await request.text()
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 })
  }
  if (raw.length > MAX_BODY_CHARS) {
    return Response.json({ error: 'Payload too large' }, { status: 413 })
  }

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 })
  }

  const { name, email, message, website } = (body ?? {}) as {
    name?: unknown
    email?: unknown
    message?: unknown
    website?: unknown
  }

  // Honeypot — the form's hidden `website` field is invisible to humans
  // (off-screen + tabIndex=-1 + aria-hidden), so any non-empty value is
  // a bot. Return 200 success to avoid telegraphing the trap.
  if (typeof website === 'string' && website.trim() !== '') {
    return Response.json({ success: true })
  }

  // Sanitize first so length checks measure the value we'll actually send.
  const safeName    = (typeof name === 'string' ? name : '').replace(HEADER_BREAKERS, ' ').trim()
  const safeEmail   = (typeof email === 'string' ? email : '').replace(HEADER_BREAKERS, ' ').trim()
  // Normalise line endings before collapsing runs of blank lines so Windows
  // CRLF sequences are not double-counted against the {3,} threshold.
  const safeMessage = (typeof message === 'string' ? message : '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

  if (!safeName || !safeEmail || !safeMessage) {
    return Response.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (safeName.length > MAX.name || safeEmail.length > MAX.email || safeMessage.length > MAX.message) {
    return Response.json({ error: 'Input too long' }, { status: 400 })
  }

  if (!EMAIL_RE.test(safeEmail)) {
    return Response.json({ error: 'Invalid email' }, { status: 400 })
  }

  // Server-side idempotency: the client AbortController cancels the fetch
  // but the Resend SDK request may already be in flight, so without dedup a
  // fast double-submit ships the same email twice.
  const idemKey = contactDedup.key(safeEmail, safeMessage)
  if (contactDedup.isDuplicate(idemKey)) {
    return Response.json({ success: true })
  }
  // Reserve the key BEFORE the send so a concurrent in-flight duplicate (the
  // exact double-submit case) is blocked rather than sending twice. Released on
  // any failure below so a genuine retry isn't suppressed; refreshed to full TTL
  // once the send confirms.
  contactDedup.reserve(idemKey)

  // Wrap in a timeout so a stalled Resend API doesn't hold the serverless
  // execution slot open for the full platform timeout (~10s).
  const sendPromise = resend.emails.send({
    from:    'Contact Form <contact@ily2a.net>',
    to:      'contact@ily2a.net',
    replyTo: safeEmail,
    subject: 'New portfolio inquiry',
    text:    `Name: ${safeName}
Email: ${safeEmail}

Reason: ${safeMessage}`,
  })
  // Swallow a post-timeout rejection so Node doesn't log an unhandled rejection
  // when Resend eventually fails after we've already returned the 500.
  sendPromise.catch(() => {})

  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('timeout')), 8000)
  })

  let result: Awaited<typeof sendPromise>
  try {
    result = await Promise.race([sendPromise, timeoutPromise])
  } catch {
    contactDedup.release(idemKey)
    return Response.json({ error: 'Failed to send message' }, { status: 500 })
  } finally {
    clearTimeout(timeoutId)
  }

  if (result?.error) {
    contactDedup.release(idemKey)
    return Response.json({ error: 'Failed to send message' }, { status: 500 })
  }

  contactDedup.markSent(idemKey)
  return Response.json({ success: true })
}
