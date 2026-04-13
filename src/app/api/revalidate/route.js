import { revalidateTag } from 'next/cache'
import { timingSafeStringEqual, createRateLimiter } from '@/lib/api'

// POST /api/revalidate
// Called by a Sanity webhook on document publish/unpublish.
// Requires SANITY_REVALIDATION_SECRET in env and a matching secret in the Sanity webhook config.

// Bound authenticated calls — prevents an attacker with a leaked secret from
// repeatedly draining the Next.js cache and exhausting Sanity API rate limits.
const isRateLimited = createRateLimiter({ limit: 60, windowMs: 60 * 60 * 1000 })

export async function POST(request) {
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

  if (isRateLimited(secret)) {
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
