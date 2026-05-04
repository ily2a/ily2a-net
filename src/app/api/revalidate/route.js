import { revalidateTag } from 'next/cache'
import { getClientIp, timingSafeStringEqual, createRateLimiter } from '@/lib/api'

// POST /api/revalidate
// Called by a Sanity webhook on document publish/unpublish.
// Requires SANITY_REVALIDATION_SECRET in env and a matching secret in the Sanity webhook config.

// Pre-auth IP throttle — bounds brute-force attempts against the secret before
// the timing-safe compare runs. Sized loose enough that a misconfigured webhook
// retry loop won't trip it from a single Sanity egress IP.
const isPreAuthRateLimited = createRateLimiter({ limit: 20, windowMs: 60 * 60 * 1000 })

// Post-auth quota — prevents a leaked secret from draining Next.js cache and
// exhausting Sanity API rate limits. Keyed on a fixed string so Sanity's egress
// IP pool doesn't share a bucket with attackers.
const isRateLimited = createRateLimiter({ limit: 60, windowMs: 60 * 60 * 1000 })
const RATE_LIMIT_KEY = 'sanity-webhook'

export async function POST(request) {
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
    revalidateTag('sanity')
  } catch (err) {
    console.error('[/api/revalidate] revalidateTag threw:', err)
    return Response.json({ error: 'Revalidation failed' }, { status: 500 })
  }

  return Response.json({ revalidated: true, at: new Date().toISOString() })
}
