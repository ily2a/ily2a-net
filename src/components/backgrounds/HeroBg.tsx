'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import { Renderer, Program, Mesh, Triangle } from 'ogl'
import { useWebGLBackground } from '@/hooks/useWebGLBackground'
import { AMETHYST } from '@/constants/colors'
import { hexToRgbNormalized } from '@/lib/color'

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

const prepStops = (stops?: string[]): { arr: [number, number, number][]; count: number } => {
  const base = (stops && stops.length ? stops : [AMETHYST[950], AMETHYST[400]]).slice(0, MAX_COLORS)
  // The loops below pad `base` to exactly MAX_COLORS entries, so every index
  // read here is in-bounds; the non-null assertions just satisfy the compiler.
  if (base.length === 1) base.push(base[0]!)
  while (base.length < MAX_COLORS) base.push(base[base.length - 1]!)
  const arr: [number, number, number][] = []
  for (let i = 0; i < MAX_COLORS; i++) arr.push(hexToRgbNormalized(base[i]!))
  const count = Math.max(2, Math.min(MAX_COLORS, stops?.length ?? 2))
  return { arr, count }
}

interface HeroBgProps {
  className?: string
  onFirstFrame?: () => void
  gradientColors?: string[]
  angle?: number
  noise?: number
  blindCount?: number
  blindMinWidth?: number
  mouseDampening?: number
  mirrorGradient?: boolean
  spotlightRadius?: number
  spotlightSoftness?: number
  spotlightOpacity?: number
  mixBlendMode?: CSSProperties['mixBlendMode']
  autoAnimate?: boolean
  autoSpeed?: number
  attractRadius?: number
}

const HeroBg = ({
  className = '',
  onFirstFrame,
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
  mixBlendMode = 'lighten',
  autoAnimate = false,
  autoSpeed = 0.4,
  attractRadius = 0.35,
}: HeroBgProps) => {
  const containerRef    = useRef<HTMLDivElement>(null)
  const didFirstFrameRef = useRef(false)
  const programRef      = useRef<Program | null>(null)
  const meshRef         = useRef<Mesh | null>(null)
  const geometryRef     = useRef<Triangle | null>(null)
  const rendererRef     = useRef<Renderer | null>(null)
  const mouseTargetRef  = useRef<[number, number]>([0, 0])
  const canvasRectRef   = useRef<DOMRect | null>(null)
  const lastTimeRef     = useRef(0)
  const firstResizeRef  = useRef(true)

  // ── Loop-read refs ──────────────────────────────────────────────────────────
  // Changing these does NOT recreate the WebGL context — render() reads from
  // refs so React never needs to tear down/rebuild the renderer on prop changes.
  const mouseDampeningRef    = useRef(mouseDampening)
  const autoAnimateRef       = useRef(autoAnimate)
  const autoSpeedRef         = useRef(autoSpeed)
  const attractRadiusRef     = useRef(attractRadius)
  const blindCountRef        = useRef(blindCount)
  const blindMinWidthRef     = useRef(blindMinWidth)
  const onFirstFrameRef      = useRef(onFirstFrame)

  useEffect(() => {
    mouseDampeningRef.current = mouseDampening
    autoAnimateRef.current    = autoAnimate
    autoSpeedRef.current      = autoSpeed
    attractRadiusRef.current  = attractRadius
    blindCountRef.current     = blindCount
    blindMinWidthRef.current  = blindMinWidth
    onFirstFrameRef.current   = onFirstFrame
  }, [mouseDampening, autoAnimate, autoSpeed, attractRadius, blindCount, blindMinWidth, onFirstFrame])

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
    const { arr: colorArr, count: colorCount } = prepStops(gradientColors)
    for (let i = 0; i < MAX_COLORS; i++) uniforms[`uColor${i}`].value = colorArr[i]
    uniforms.uColorCount.value = colorCount
  }, [angle, noise, blindCount, mirrorGradient, spotlightRadius, spotlightSoftness, spotlightOpacity, gradientColors])

  // ── GL setup — pause/resume, reduced motion, and context-loss recovery are
  // owned by useWebGLBackground. setup() builds the renderer/program/mesh and
  // returns the lifecycle contract; render() holds the mouse-damping /
  // auto-animate math. Rebuilds only when DPR changes. ──────────────────────
  useWebGLBackground(containerRef, (container) => {
    const renderer = new Renderer({
      // Cap at 1.5 — on a DPR-3 phone the shader otherwise renders at 3×
      // (9× pixels), which saturates the GPU and destroys mobile INP.
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
      alpha: true,
      antialias: false, // doubles pixel work on Retina for no visible gain in a shader effect
    })
    rendererRef.current = renderer
    const gl = renderer.gl
    const canvas = gl.canvas

    canvas.className = 'w-full h-full block'
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
      canvasRectRef.current = rect
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

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvasRectRef.current
      if (!rect) return
      const scale = renderer.dpr || 1
      const x = (e.clientX - rect.left) * scale
      const y = (rect.height - (e.clientY - rect.top)) * scale
      mouseTargetRef.current = [x, y]
      if (mouseDampeningRef.current <= 0) uniforms.iMouse.value = [x, y]
    }
    canvas.addEventListener('pointermove', onPointerMove)

    // Page scroll changes the canvas's viewport rect without resizing it, so the
    // ResizeObserver-driven resize() never refreshes canvasRectRef. Without this,
    // onPointerMove maps the pointer through a rect captured at scroll 0 and the
    // spotlight tracks the wrong point once the hero is partly scrolled.
    const onScroll = () => { canvasRectRef.current = container.getBoundingClientRect() }
    window.addEventListener('scroll', onScroll, { passive: true })

    const paintFrame = () => {
      try {
        const m = meshRef.current
        if (m) renderer.render({ scene: m })
        if (!didFirstFrameRef.current) {
          didFirstFrameRef.current = true
          try { onFirstFrameRef.current?.() } catch {}
        }
      } catch (e) { console.error(e) }
    }

    return {
      canvas,
      isContextLost: () => gl.isContextLost(),
      resize,
      render(t: number) {
        const tSec = t * 0.001
        uniforms.iTime.value = tSec
        if (!lastTimeRef.current) lastTimeRef.current = t
        const dt = Math.min((t - lastTimeRef.current) / 1000, 0.1)
        lastTimeRef.current = t

        const W = gl.drawingBufferWidth
        const H = gl.drawingBufferHeight
        // iMouse.value is a 2-element [x, y] vec (mutated in place each frame);
        // type it as a tuple so the index reads/writes below are checked as defined.
        const cur = uniforms.iMouse.value as [number, number]
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

        paintFrame()
      },
      renderStatic() {
        // One still frame for reduced motion — still fire the first-frame hook.
        paintFrame()
      },
      dispose() {
        canvas.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('scroll', onScroll)
        if (canvas.parentElement === container) container.removeChild(canvas)
        const callIfFn = (obj: unknown, key: string) => {
          if (!obj || typeof obj !== 'object') return
          const fn = (obj as Record<string, unknown>)[key]
          if (typeof fn === 'function') fn.call(obj)
        }
        callIfFn(programRef.current, 'remove')
        callIfFn(geometryRef.current, 'remove')
        callIfFn(meshRef.current, 'remove')
        callIfFn(rendererRef.current, 'destroy')
        programRef.current = null
        geometryRef.current = null
        meshRef.current = null
        rendererRef.current = null
      },
    }
  }, [])

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

export default HeroBg
