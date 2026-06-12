import { revalidateTag } from 'next/cache'
import { getClientIp, timingSafeStringEqual, createRateLimiter } from '@/lib/api'

// POST /api/revalidate
// Called by a Sanity webhook on document publish/unpublish.
// Requires SANITY_REVALIDATION_SECRET in env and a matching secret in the Sanity webhook config.

// Pre-auth IP throttle — bounds brute-force attempts against the secret before
// the timing-safe compare runs. Must sit ABOVE the post-auth quota below (60/hr):
// Sanity webhooks all arrive from one egress IP, so a tighter pre-auth cap would
// make the post-auth budget unreachable and 429 a busy editing session before
// the secret is even checked.
const isPreAuthRateLimited = createRateLimiter({ limit: 120, windowMs: 60 * 60 * 1000 })

// Post-auth quota — prevents a leaked secret from draining Next.js cache and
// exhausting Sanity API rate limits. Keyed on a fixed string so Sanity's egress
// IP pool doesn't share a bucket with attackers.
const isRateLimited = createRateLimiter({ limit: 60, windowMs: 60 * 60 * 1000 })
const RATE_LIMIT_KEY = 'sanity-webhook'

export async function POST(request: Request) {
  if (isPreAuthRateLimited(getClientIp(request))) {
    return Response.json({ error: 'Too many requests' }, { status: 429 })
  }

  const secret   = request.headers.get('x-sanity-webhook-secret')
  const expected = process.env.SANITY_REVALIDATION_SECRET
  // Treat misconfiguration the same as a bad secret externally — don't leak
  // server state to unauthenticated callers. Log to the server only.
  if (!expected) {
    console.error('[/api/revalidate] SANITY_REVALIDATION_SECRET is not set')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Explicit null guard — request.headers.get() returns null when absent.
  // timingSafeStringEqual already rejects non-strings, but the intent is clearer here.
  if (!secret || !timingSafeStringEqual(secret, expected)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (isRateLimited(RATE_LIMIT_KEY)) {
    return Response.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    // Next 16 deprecated single-arg revalidateTag and its own runtime warning
    // tells callers to pass "max" (the full-purge profile) — which is exactly
    // this webhook's intent: invalidate every entry tagged 'sanity'.
    revalidateTag('sanity', 'max')
  } catch (err) {
    console.error('[/api/revalidate] revalidateTag threw:', err)
    return Response.json({ error: 'Revalidation failed' }, { status: 500 })
  }

  return Response.json({ revalidated: true, at: new Date().toISOString() })
}
