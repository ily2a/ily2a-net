'use client'

import { useEffect, useRef, useState, useId, useMemo } from 'react'

// Module-level cache — browser support is detected once on first mount,
// shared across all GlassSurface instances on the page.
let _svgSupportCache = null
let _backdropSupportCache = null

// Hoisted to module level — never changes, no need to recreate on every render.
const VALID_BLEND_MODES = new Set([
  'normal','multiply','screen','overlay','darken','lighten',
  'color-dodge','color-burn','hard-light','soft-light',
  'difference','exclusion','hue','saturation','color','luminosity'
])

function detectSVGFilterSupport(filterId) {
  if (_svgSupportCache !== null) return _svgSupportCache
  if (typeof window === 'undefined' || typeof document === 'undefined') return false
  if (CSS.supports('-moz-appearance', 'none')) { _svgSupportCache = false; return false }
  if (CSS.supports('hanging-punctuation', 'first')) { _svgSupportCache = false; return false }
  const div = document.createElement('div')
  div.style.backdropFilter = `url(#${filterId})`
  _svgSupportCache = div.style.backdropFilter !== ''
  return _svgSupportCache
}

function detectBackdropSupport() {
  if (_backdropSupportCache !== null) return _backdropSupportCache
  _backdropSupportCache = typeof CSS !== 'undefined' && CSS.supports('backdrop-filter', 'blur(10px)')
  return _backdropSupportCache
}

const GlassSurface = ({
  children,
  width = '100%',
  height = 64,
  borderRadius = 12,
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  displace = 0,
  backgroundOpacity = 0,
  saturation = 1,
  distortionScale = -180,
  redOffset = 0,
  greenOffset = 10,
  blueOffset = 20,
  xChannel = 'R',
  yChannel = 'G',
  mixBlendMode = 'difference',
  fallbackBlur = 20,
  fallbackSaturation = 300,
  className = '',
  style = {}
}) => {
  const uniqueId = useId().replace(/:/g, '-')
  const filterId = `glass-filter-${uniqueId}`
  const redGradId = `red-grad-${uniqueId}`
  const blueGradId = `blue-grad-${uniqueId}`

  const [svgSupported, setSvgSupported] = useState(false)
  const [backdropSupported, setBackdropSupported] = useState(true)
  const [mounted, setMounted] = useState(false)

  const containerRef = useRef(null)
  const feImageRef = useRef(null)
  const redChannelRef = useRef(null)
  const greenChannelRef = useRef(null)
  const blueChannelRef = useRef(null)
  const gaussianBlurRef = useRef(null)

  // Always-current ref so ResizeObserver never holds a stale closure
  const updateRef  = useRef(null)
  // Cache last rendered dimensions — skip SVG regen when size hasn't changed
  const lastSizeRef = useRef({ w: 0, h: 0 })

  const safeBlendMode = VALID_BLEND_MODES.has(mixBlendMode) ? mixBlendMode : 'normal'

  const generateDisplacementMap = () => {
    const rect = containerRef.current?.getBoundingClientRect()
    const actualWidth = rect?.width || 400
    const actualHeight = rect?.height || 64
    const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5)

    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${safeBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
      </svg>
    `

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`
  }

  const updateDisplacementMap = () => {
    const rect = containerRef.current?.getBoundingClientRect()
    const w = rect?.width  || 0
    const h = rect?.height || 0
    // Skip SVG regeneration if dimensions haven't changed (avoids redundant work during resize)
    if (w === lastSizeRef.current.w && h === lastSizeRef.current.h) return
    lastSizeRef.current = { w, h }
    feImageRef.current?.setAttribute('href', generateDisplacementMap())
  }

  // Keep the ref pointing at the latest version — avoids stale closure in ResizeObserver
  useEffect(() => { updateRef.current = updateDisplacementMap })

  // Compute support flags once on mount (results cached at module level across instances)
  useEffect(() => {
    setMounted(true)
    setSvgSupported(detectSVGFilterSupport(filterId))
    setBackdropSupported(detectBackdropSupport())
  }, [filterId])

  // Update SVG filter attributes when relevant props change
  useEffect(() => {
    if (!mounted) return
    updateDisplacementMap()
    ;[
      { ref: redChannelRef, offset: redOffset },
      { ref: greenChannelRef, offset: greenOffset },
      { ref: blueChannelRef, offset: blueOffset }
    ].forEach(({ ref, offset }) => {
      if (ref.current) {
        ref.current.setAttribute('scale', (distortionScale + offset).toString())
        ref.current.setAttribute('xChannelSelector', xChannel)
        ref.current.setAttribute('yChannelSelector', yChannel)
      }
    })
    gaussianBlurRef.current?.setAttribute('stdDeviation', displace.toString())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, borderRadius, borderWidth, brightness, opacity, blur, displace, distortionScale, redOffset, greenOffset, blueOffset, xChannel, yChannel, mixBlendMode])

  // ResizeObserver — uses ref so it always calls the latest updateDisplacementMap.
  // setTimeout(fn, 0) is intentional: avoids "ResizeObserver loop" browser warnings.
  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(() => updateRef.current?.(), 0)
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // React to explicit width/height prop changes — no setTimeout needed here
  useEffect(() => {
    if (mounted) updateRef.current?.()
  }, [width, height, mounted])

  const containerStyles = useMemo(() => {
    const baseStyles = {
      ...style,
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      borderRadius: `${borderRadius}px`,
    }

    // SSR / not mounted yet — neutral style, no client checks
    if (!mounted) {
      return {
        ...baseStyles,
        background: `rgba(21, 26, 30, ${Math.max(backgroundOpacity, 0.05)})`,
        backdropFilter: `blur(${fallbackBlur}px) saturate(${fallbackSaturation}%)`,
        WebkitBackdropFilter: `blur(${fallbackBlur}px) saturate(${fallbackSaturation}%)`,
        boxShadow: 'var(--shadow-glass)',
      }
    }

    if (svgSupported) {
      return {
        ...baseStyles,
        background: `hsl(0 0% 0% / ${backgroundOpacity})`,
        backdropFilter: `url(#${filterId}) saturate(${saturation})`,
        boxShadow: 'var(--shadow-glass)',
      }
    }

    if (!backdropSupported) {
      return {
        ...baseStyles,
        background: `rgba(21, 26, 30, ${Math.max(backgroundOpacity, 0.4)})`,
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }
    }

    return {
      ...baseStyles,
      background: `rgba(21, 26, 30, ${Math.max(backgroundOpacity, 0.05)})`,
      backdropFilter: `blur(${fallbackBlur}px) saturate(${fallbackSaturation}%)`,
      WebkitBackdropFilter: `blur(${fallbackBlur}px) saturate(${fallbackSaturation}%)`,
      boxShadow: 'var(--shadow-glass)',
    }
  }, [mounted, svgSupported, backdropSupported, style, width, height, borderRadius, backgroundOpacity, saturation, filterId, fallbackBlur, fallbackSaturation])

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={containerStyles}
    >
      {mounted && (
        <svg
          className="w-full h-full pointer-events-none absolute inset-0 opacity-0 -z-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id={filterId} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
              <feImage ref={feImageRef} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
              <feDisplacementMap ref={redChannelRef} in="SourceGraphic" in2="map" result="dispRed" />
              <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
              <feDisplacementMap ref={greenChannelRef} in="SourceGraphic" in2="map" result="dispGreen" />
              <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
              <feDisplacementMap ref={blueChannelRef} in="SourceGraphic" in2="map" result="dispBlue" />
              <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
              <feBlend in="red" in2="green" mode="screen" result="rg" />
              <feBlend in="rg" in2="blue" mode="screen" result="output" />
              <feGaussianBlur ref={gaussianBlurRef} in="output" stdDeviation="0.7" />
            </filter>
          </defs>
        </svg>
      )}
      <div className="w-full h-full flex items-center justify-center relative z-10">
        {children}
      </div>
    </div>
  )
}

export default GlassSurface
