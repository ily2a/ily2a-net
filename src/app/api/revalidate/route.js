import { revalidateTag } from 'next/cache'
import { timingSafeStringEqual } from '@/lib/api'

// POST /api/revalidate
// Called by a Sanity webhook on document publish/unpublish.
// Requires SANITY_REVALIDATION_SECRET in env and a matching secret in the Sanity webhook config.
export async function POST(request) {
  const secret   = request.headers.get('x-sanity-webhook-secret')
  const expected = process.env.SANITY_REVALIDATION_SECRET
  // Treat misconfiguration the same as a bad secret externally — don't leak
  // server state to unauthenticated callers. Log to the server only.
  if (!expected) {
    console.error('[/api/revalidate] SANITY_REVALIDATION_SECRET is not set')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!timingSafeStringEqual(secret, expected)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  revalidateTag('sanity')
  return Response.json({ revalidated: true, at: new Date().toISOString() })
}
