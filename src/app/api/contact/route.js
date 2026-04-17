import { Resend } from 'resend'
import { EMAIL_RE, CONTACT_MAX as MAX } from '@/lib/validation'
import { getClientIp, createRateLimiter } from '@/lib/api'

const resend = new Resend(process.env.RESEND_API_KEY)

// 5 requests per IP per hour. See lib/api.js for caveats around per-instance state.
const isRateLimited = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 })

export async function POST(request) {
  if (isRateLimited(getClientIp(request))) {
    return Response.json({ error: 'Too many requests' }, { status: 429 })
  }

  // ── Parse body ──
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 })
  }

  const { name, email, message } = body ?? {}

  // Sanitize first so length checks measure the value we'll actually send.
  // Strip CR, LF, and horizontal tab to prevent header injection via the subject line.
  const safeName    = (name ?? '').replace(/[\r\n\t]/g, ' ').trim()
  const safeEmail   = (email ?? '').replace(/[\r\n\t]/g, ' ').trim()
  // Normalise line endings before collapsing runs of blank lines so Windows
  // CRLF sequences (\r\n) are not double-counted against the {3,} threshold.
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

  // Wrap in a timeout so a stalled Resend API doesn't hold the serverless
  // execution slot open for the full platform timeout (~10s).
  const sendPromise = resend.emails.send({
    from:    'Contact Form <contact@ily2a.net>',
    to:      'contact@ily2a.net',
    replyTo: safeEmail,
    subject: `New message from ${safeName}`,
    text:    `Name: ${safeName}\nEmail: ${safeEmail}\n\n${safeMessage}`,
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
