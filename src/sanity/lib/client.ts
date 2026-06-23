import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Base client — consumed by defineLive (live.ts) for request-time live
               // queries, and by fetchSanityListStatic for build-time data
               // (generateStaticParams, sitemap) that can't call draftMode().
})
