import { revalidateTag } from 'next/cache'

// POST /api/revalidate
// Called by a Sanity webhook on document publish/unpublish.
// Requires SANITY_REVALIDATION_SECRET in env and a matching secret in the Sanity webhook config.
export async function POST(request) {
  const secret = request.headers.get('x-sanity-webhook-secret')
  if (secret !== process.env.SANITY_REVALIDATION_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  revalidateTag('sanity')
  return Response.json({ revalidated: true, at: new Date().toISOString() })
}
