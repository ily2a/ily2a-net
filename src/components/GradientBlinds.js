'use client'

import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle } from 'ogl'

const MAX_COLORS = 8

// Shader source strings defined at module level — created once, never recreated.
const VERTEX_SHADER = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
#ifdef GL_ES
precision mediump float;
#endif
uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;
uniform float uAngle;
uniform float uNoise;
uniform float uBlindCount;
uniform float uSpotlightRadius;
uniform float uSpotlightSoftness;
uniform float uSpotlightOpacity;
uniform float uMirror;
uniform float uDistort;
uniform float uShineFlip;
uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;
varying vec2 vUv;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
}
vec2 rotate2D(vec2 p, float a){
  float c = cos(a); float s = sin(a);
  return mat2(c, -s, s, c) * p;
}
vec3 getGradientColor(float t){
  float tt = clamp(t, 0.0, 1.0);
  int count = uColorCount;
  if (count < 2) count = 2;
  float scaled = tt * float(count - 1);
  float seg = floor(scaled);
  float f = fract(scaled);
  if (seg < 1.0) return mix(uColor0, uColor1, f);
  if (seg < 2.0 && count > 2) return mix(uColor1, uColor2, f);
  if (seg < 3.0 && count > 3) return mix(uColor2, uColor3, f);
  if (seg < 4.0 && count > 4) return mix(uColor3, uColor4, f);
  if (seg < 5.0 && count > 5) return mix(uColor4, uColor5, f);
  if (seg < 6.0 && count > 6) return mix(uColor5, uColor6, f);
  if (seg < 7.0 && count > 7) return mix(uColor6, uColor7, f);
  if (count > 7) return uColor7;
  if (count > 6) return uColor6;
  if (count > 5) return uColor5;
  if (count > 4) return uColor4;
  if (count > 3) return uColor3;
  if (count > 2) return uColor2;
  return uColor1;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv0 = fragCoord.xy / iResolution.xy;
  float aspect = iResolution.x / iResolution.y;
  vec2 p = uv0 * 2.0 - 1.0;
  p.x *= aspect;
  vec2 pr = rotate2D(p, uAngle);
  pr.x /= aspect;
  vec2 uv = pr * 0.5 + 0.5;
  vec2 uvMod = uv;
  if (uDistort > 0.0) {
    // 6.0 = spatial frequency of the distortion wave — higher = more ripples.
    float a = uvMod.y * 6.0;
    float b = uvMod.x * 6.0;
    float w = 0.01 * uDistort;
    uvMod.x += sin(a) * w;
    uvMod.y += cos(b) * w;
  }
  float t = uvMod.x;
  if (uMirror > 0.5) t = 1.0 - abs(1.0 - 2.0 * fract(t));
  vec3 base = getGradientColor(t);
  vec2 offset = vec2(iMouse.x / iResolution.x, iMouse.y / iResolution.y);
  float d = length(uv0 - offset);
  float r = max(uSpotlightRadius, 1e-4);
  float dn = d / r;
  float spot = (1.0 - 2.0 * pow(dn, uSpotlightSoftness)) * uSpotlightOpacity;
  vec3 cir = vec3(spot);
  float stripe = fract(uvMod.x * max(uBlindCount, 1.0));
  if (uShineFlip > 0.5) stripe = 1.0 - stripe;
  vec3 ran = vec3(stripe);
  vec3 col = cir + base - ran;
  col += (rand(gl_FragCoord.xy + iTime) - 0.5) * uNoise;
  fragColor = vec4(col, 1.0);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`
const hexToRGB = hex => {
  const c = hex.replace('#', '').padEnd(6, '0')
  const r = parseInt(c.slice(0, 2), 16) / 255
  const g = parseInt(c.slice(2, 4), 16) / 255
  const b = parseInt(c.slice(4, 6), 16) / 255
  return [r, g, b]
}
const prepStops = stops => {
  const base = (stops && stops.length ? stops : ['#FF9FFC', '#5227FF']).slice(0, MAX_COLORS)
  if (base.length === 1) base.push(base[0])
  while (base.length < MAX_COLORS) base.push(base[base.length - 1])
  const arr = []
  for (let i = 0; i < MAX_COLORS; i++) arr.push(hexToRGB(base[i]))
  const count = Math.max(2, Math.min(MAX_COLORS, stops?.length ?? 2))
  return { arr, count }
}

const GradientBlinds = ({
  className = '',
  dpr,
  paused = false,
  gradientColors,
  angle = 0,
  noise = 0.3,
  blindCount = 16,
  blindMinWidth = 60,
  mouseDampening = 0.15,
  mirrorGradient = false,
  spotlightRadius = 0.5,
  spotlightSoftness = 1,
  spotlightOpacity = 1,
  distortAmount = 0,
  shineDirection = 'left',
  mixBlendMode = 'lighten',
  autoAnimate = false,
  autoSpeed = 0.4,
  attractRadius = 0.35,
}) => {
  const containerRef    = useRef(null)
  const rafRef          = useRef(null)
  const programRef      = useRef(null)
  const meshRef         = useRef(null)
  const geometryRef     = useRef(null)
  const rendererRef     = useRef(null)
  const mouseTargetRef  = useRef([0, 0])
  const lastTimeRef     = useRef(0)
  const firstResizeRef  = useRef(true)

  // ── Loop-read refs ──────────────────────────────────────────────────────────
  // Changing these does NOT recreate the WebGL context — the loop reads from
  // refs so React never needs to tear down/rebuild the renderer on prop changes.
  const pausedRef         = useRef(paused)
  const mouseDampeningRef = useRef(mouseDampening)
  const autoAnimateRef    = useRef(autoAnimate)
  const autoSpeedRef      = useRef(autoSpeed)
  const attractRadiusRef  = useRef(attractRadius)
  const blindCountRef     = useRef(blindCount)
  const blindMinWidthRef  = useRef(blindMinWidth)

  useEffect(() => {
    pausedRef.current         = paused
    mouseDampeningRef.current = mouseDampening
    autoAnimateRef.current    = autoAnimate
    autoSpeedRef.current      = autoSpeed
    attractRadiusRef.current  = attractRadius
    blindCountRef.current     = blindCount
    blindMinWidthRef.current  = blindMinWidth
  }, [paused, mouseDampening, autoAnimate, autoSpeed, attractRadius, blindCount, blindMinWidth])

  // ── Uniform update — no context rebuild ────────────────────────────────────
  // Updates shader uniforms in-place whenever visual props change.
  useEffect(() => {
    const uniforms = programRef.current?.uniforms
    if (!uniforms) return
    uniforms.uAngle.value             = (angle * Math.PI) / 180
    uniforms.uNoise.value             = noise
    uniforms.uBlindCount.value        = Math.max(1, blindCount)
    uniforms.uMirror.value            = mirrorGradient ? 1 : 0
    uniforms.uSpotlightRadius.value   = spotlightRadius
    uniforms.uSpotlightSoftness.value = spotlightSoftness
    uniforms.uSpotlightOpacity.value  = spotlightOpacity
    uniforms.uDistort.value           = distortAmount
    uniforms.uShineFlip.value         = shineDirection === 'right' ? 1 : 0
    const { arr: colorArr, count: colorCount } = prepStops(gradientColors)
    for (let i = 0; i < MAX_COLORS; i++) uniforms[`uColor${i}`].value = colorArr[i]
    uniforms.uColorCount.value = colorCount
  }, [angle, noise, blindCount, mirrorGradient, spotlightRadius, spotlightSoftness, spotlightOpacity, distortAmount, shineDirection, gradientColors])

  // ── Main WebGL setup — runs only when DPR changes (effectively once on mount) ─
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new Renderer({
      dpr: dpr ?? (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1),
      alpha: true,
      antialias: true,
    })
    rendererRef.current = renderer
    const gl = renderer.gl
    const canvas = gl.canvas

    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    container.appendChild(canvas)

    const { arr: colorArr, count: colorCount } = prepStops(gradientColors)
    const uniforms = {
      iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
      iMouse:            { value: [0, 0] },
      iTime:             { value: 0 },
      uAngle:            { value: (angle * Math.PI) / 180 },
      uNoise:            { value: noise },
      uBlindCount:       { value: Math.max(1, blindCount) },
      uSpotlightRadius:  { value: spotlightRadius },
      uSpotlightSoftness:{ value: spotlightSoftness },
      uSpotlightOpacity: { value: spotlightOpacity },
      uMirror:           { value: mirrorGradient ? 1 : 0 },
      uDistort:          { value: distortAmount },
      uShineFlip:        { value: shineDirection === 'right' ? 1 : 0 },
      uColor0:           { value: colorArr[0] },
      uColor1:           { value: colorArr[1] },
      uColor2:           { value: colorArr[2] },
      uColor3:           { value: colorArr[3] },
      uColor4:           { value: colorArr[4] },
      uColor5:           { value: colorArr[5] },
      uColor6:           { value: colorArr[6] },
      uColor7:           { value: colorArr[7] },
      uColorCount:       { value: colorCount },
    }

    const program = new Program(gl, { vertex: VERTEX_SHADER, fragment: FRAGMENT_SHADER, uniforms })
    programRef.current = program
    const geometry = new Triangle(gl)
    geometryRef.current = geometry
    const mesh = new Mesh(gl, { geometry, program })
    meshRef.current = mesh

    const resize = () => {
      const rect = container.getBoundingClientRect()
      renderer.setSize(rect.width, rect.height)
      uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1]
      const bc  = blindCountRef.current
      const bmw = blindMinWidthRef.current
      if (bmw && bmw > 0) {
        const maxByMinWidth = Math.max(1, Math.floor(rect.width / bmw))
        uniforms.uBlindCount.value = Math.max(1, Math.min(bc, maxByMinWidth))
      } else {
        uniforms.uBlindCount.value = Math.max(1, bc)
      }
      if (firstResizeRef.current) {
        firstResizeRef.current = false
        const cx = gl.drawingBufferWidth / 2
        const cy = gl.drawingBufferHeight / 2
        uniforms.iMouse.value = [cx, cy]
        mouseTargetRef.current = [cx, cy]
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const onPointerMove = e => {
      const rect = canvas.getBoundingClientRect()
      const scale = renderer.dpr || 1
      const x = (e.clientX - rect.left) * scale
      const y = (rect.height - (e.clientY - rect.top)) * scale
      mouseTargetRef.current = [x, y]
      if (mouseDampeningRef.current <= 0) uniforms.iMouse.value = [x, y]
    }
    canvas.addEventListener('pointermove', onPointerMove)

    // Shared pause/resume — used by both visibilitychange and IntersectionObserver.
    const setActive = (active) => {
      if (!active) {
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      } else if (!rafRef.current && !prefersReducedMotion) {
        rafRef.current = requestAnimationFrame(loop)
      }
    }

    const onVisibilityChange = () => setActive(!document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)

    // Pause the RAF loop when the container is scrolled out of view.
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: '200px' })
    io.observe(container)

    const loop = t => {
      rafRef.current = requestAnimationFrame(loop)
      const tSec = t * 0.001
      uniforms.iTime.value = tSec
      if (!lastTimeRef.current) lastTimeRef.current = t
      const dt = Math.min((t - lastTimeRef.current) / 1000, 0.1)
      lastTimeRef.current = t

      const W = gl.drawingBufferWidth
      const H = gl.drawingBufferHeight
      const cur = uniforms.iMouse.value
      const mouse = mouseTargetRef.current

      if (autoAnimateRef.current) {
        const ax = (Math.sin(tSec * autoSpeedRef.current * 0.7) * 0.38 + 0.5) * W
        const ay = (Math.cos(tSec * autoSpeedRef.current * 0.5 + 1.2) * 0.38 + 0.5) * H
        const dx = mouse[0] - cur[0]
        const dy = mouse[1] - cur[1]
        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxDist = attractRadiusRef.current * Math.max(W, H)
        let targetX, targetY
        if (dist < maxDist) {
          const raw = 1.0 - dist / maxDist
          const ease = raw * raw * (3 - 2 * raw)
          targetX = ax + (mouse[0] - ax) * ease
          targetY = ay + (mouse[1] - ay) * ease
        } else {
          targetX = ax
          targetY = ay
        }
        const tau = Math.max(1e-4, mouseDampeningRef.current)
        const factor = Math.min(1, 1 - Math.exp(-dt / tau))
        cur[0] += (targetX - cur[0]) * factor
        cur[1] += (targetY - cur[1]) * factor
      } else if (mouseDampeningRef.current > 0) {
        const tau = Math.max(1e-4, mouseDampeningRef.current)
        const factor = Math.min(1, 1 - Math.exp(-dt / tau))
        cur[0] += (mouse[0] - cur[0]) * factor
        cur[1] += (mouse[1] - cur[1]) * factor
      }

      if (!pausedRef.current && programRef.current && meshRef.current) {
        try { renderer.render({ scene: meshRef.current }) } catch (e) { console.error(e) }
      }
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      // Render one static frame then stop — respect accessibility preference
      try { renderer.render({ scene: meshRef.current }) } catch (e) { console.error(e) }
    } else {
      rafRef.current = requestAnimationFrame(loop)
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      canvas.removeEventListener('pointermove', onPointerMove)
      ro.disconnect()
      io.disconnect()
      if (canvas.parentElement === container) container.removeChild(canvas)
      const callIfFn = (obj, key) => { if (obj && typeof obj[key] === 'function') obj[key].call(obj) }
      callIfFn(programRef.current, 'remove')
      callIfFn(geometryRef.current, 'remove')
      callIfFn(meshRef.current, 'remove')
      callIfFn(rendererRef.current, 'destroy')
      programRef.current = null
      geometryRef.current = null
      meshRef.current = null
      rendererRef.current = null
    }
  // Only DPR triggers a full context rebuild. All other props are handled via
  // refs (loop-read values) or the uniform update effect above.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dpr])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={className || undefined}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        mixBlendMode: mixBlendMode || undefined,
      }}
    />
  )
}

export default GradientBlinds
