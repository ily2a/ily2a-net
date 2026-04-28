import { Resend } from 'resend'
import { EMAIL_RE, CONTACT_MAX as MAX } from '@/lib/validation'
import { getClientIp, createRateLimiter } from '@/lib/api'

const resend = new Resend(process.env.RESEND_API_KEY)

// 5 requests per IP per hour. See lib/api.js for caveats around per-instance state.
const isRateLimited = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 })

// Hard cap on raw POST body (in characters). Cuts off oversized payloads
// before JSON.parse allocates them.
const MAX_BODY_CHARS = 16_000

// Strip ASCII + Unicode line/header terminators that could break out of a
// MIME header when interpolated into the email subject. Covers CR, LF, TAB,
// NEL (U+0085), VT (U+000B), FF (U+000C), LINE SEP (U+2028), PARA SEP (U+2029).
const HEADER_BREAKERS = /[\r\n\t\u0085\u000B\u000C\u2028\u2029]/g

// In-memory dedup. FNV-1a-style hash of email + normalised message. If the
// same payload arrives twice within DEDUP_TTL we report success without
// re-sending - guards against rapid double-submit (client cancels fetch
// while the Resend SDK request is already in flight) and accidental retries.
const DEDUP_TTL = 5 * 60 * 1000
const dedupCache = new Map()

function dedupKey(email, message) {
  let h = 2166136261
  const s = `${email}
${message}`
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(36)
}

function isDuplicate(key) {
  const now = Date.now()
  for (const [k, t] of dedupCache) {
    if (now - t > DEDUP_TTL) dedupCache.delete(k)
  }
  if (dedupCache.has(key)) return true
  dedupCache.set(key, now)
  return false
}

export async function POST(request) {
  if (isRateLimited(getClientIp(request))) {
    return Response.json({ error: 'Too many requests' }, { status: 429 })
  }

  // Read as text first so we can size-cap before JSON.parse allocates.
  let raw
  try {
    raw = await request.text()
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 })
  }
  if (raw.length > MAX_BODY_CHARS) {
    return Response.json({ error: 'Payload too large' }, { status: 413 })
  }

  let body
  try {
    body = JSON.parse(raw)
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 })
  }

  const { name, email, message } = body ?? {}

  // Sanitize first so length checks measure the value we'll actually send.
  const safeName    = (name ?? '').replace(HEADER_BREAKERS, ' ').trim()
  const safeEmail   = (email ?? '').replace(HEADER_BREAKERS, ' ').trim()
  // Normalise line endings before collapsing runs of blank lines so Windows
  // CRLF sequences are not double-counted against the {3,} threshold.
  const safeMessage = (message ?? '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

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
  if (isDuplicate(dedupKey(safeEmail, safeMessage))) {
    return Response.json({ success: true })
  }

  // Wrap in a timeout so a stalled Resend API doesn't hold the serverless
  // execution slot open for the full platform timeout (~10s).
  const sendPromise = resend.emails.send({
    from:    'Contact Form <contact@ily2a.net>',
    to:      'contact@ily2a.net',
    replyTo: safeEmail,
    subject: `New ily2a.net inquiry — ${safeName}`,
    text:    `Name: ${safeName}
Email: ${safeEmail}

Reason: ${safeMessage}`,
  })
  // Swallow a post-timeout rejection so Node doesn't log an unhandled rejection
  // when Resend eventually fails after we've already returned the 500.
  sendPromise.catch(() => {})

  let timeoutId
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('timeout')), 8000)
  })

  let result
  try {
    result = await Promise.race([sendPromise, timeoutPromise])
  } catch {
    return Response.json({ error: 'Failed to send message' }, { status: 500 })
  } finally {
    clearTimeout(timeoutId)
  }

  if (result?.error) {
    return Response.json({ error: 'Failed to send message' }, { status: 500 })
  }

  return Response.json({ success: true })
}
