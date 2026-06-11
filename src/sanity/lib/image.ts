import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}

// Raw asset dimensions as projected by `asset->metadata.dimensions`.
export interface SanityImageDimensions {
  width: number
  height: number
  aspectRatio: number
}

// Fractional insets the editor sets in the Studio crop tool.
interface SanityImageCropRect {
  top?: number
  bottom?: number
  left?: number
  right?: number
}

// Height the Sanity CDN will deliver for `targetWidth`, accounting for the
// editor crop (which changes the delivered aspect ratio). Feeding this into
// next/image's width/height makes the browser reserve the correct space, so
// the page doesn't shift when the real image loads. Falls back when the
// dimensions projection is missing (e.g. older documents not yet republished).
export function displayHeightFor(
  image: { crop?: SanityImageCropRect } | undefined,
  dimensions: SanityImageDimensions | undefined,
  targetWidth: number,
  fallbackHeight: number,
): number {
  if (!dimensions?.width || !dimensions?.height) return fallbackHeight
  const crop = image?.crop
  const croppedWidth  = dimensions.width  * (1 - (crop?.left ?? 0) - (crop?.right ?? 0))
  const croppedHeight = dimensions.height * (1 - (crop?.top ?? 0) - (crop?.bottom ?? 0))
  if (croppedWidth <= 0 || croppedHeight <= 0) return fallbackHeight
  return Math.round(targetWidth * (croppedHeight / croppedWidth))
}
