import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Base client — only consumed by defineLive (live.ts), never for direct queries.
               // defineLive handles real-time updates via Sanity's Live Content API.
})
