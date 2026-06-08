'use client'

import { useEffect } from 'react'
import { subscribeToModalOpen, getModalOpen } from '@/lib/modal-store'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
// Match each background's IntersectionObserver rootMargin so the synchronous
// mount-time visibility guess agrees with what the observer will report.
const ROOT_MARGIN_PX = 200

// Shared lifecycle for the ogl WebGL backgrounds. Owns the parts that were
// duplicated (and drifting) across HeroBg / ContactBg / TestimonialsVeil /
// NotFoundPasswordBg:
//   - pause the RAF loop when the container is scrolled off-screen
//     (IntersectionObserver), when the tab is hidden (visibilitychange), or when
//     a blocking modal covers the canvas (modal store — IntersectionObserver
//     does not fire for occluded-but-on-screen elements);
//   - respect reduced motion: render one static frame, never start the loop,
//     and react if the OS setting is toggled mid-session;
//   - cap wasted work: don't start the loop for a background that mounts
//     off-screen (guessed synchronously from the rect, refined by the observer);
//   - stop the loop cleanly on GL context loss and rebuild on restore.
//
// The component supplies setup(container), which builds its own renderer /
// program / mesh (and adds any component-specific listeners) and returns:
//   {
//     canvas,            // <canvas> element — context-loss listeners attach here
//     isContextLost(),   // () => boolean
//     render(t),         // draw one animated frame; t = requestAnimationFrame timestamp (ms)
//     renderStatic(),    // optional — draw one still frame (reduced motion); defaults to render(0)
//     resize(),          // optional — handle a container resize
//     dispose(),         // optional — tear down GL state and remove the canvas
//   }
// setup may return null/undefined to bail (e.g. the container is not ready).
//
// `deps` are forwarded to the underlying effect; pass [] for a mount-only setup.
export function useWebGLBackground(containerRef, setup, deps = []) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let ctx = null
    let raf = 0
    // Guess initial on-screen state synchronously so an above-the-fold
    // background paints immediately (no blank flash) while one mounted
    // off-screen never starts the loop. The observer refines this.
    let isVisible = isWithinViewport(container)
    let tabVisible = !document.hidden
    let modalOpen = getModalOpen()
    const mq = window.matchMedia(REDUCED_MOTION_QUERY)
    let reduced = mq.matches

    const canRun = () => isVisible && tabVisible && !modalOpen && !reduced

    const loop = (t) => {
      if (!ctx || ctx.isContextLost()) { raf = 0; return }
      raf = requestAnimationFrame(loop)
      ctx.render(t)
    }
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0 } }
    const start = () => { if (!raf && ctx && canRun()) raf = requestAnimationFrame(loop) }
    const sync = () => { if (canRun()) start(); else stop() }

    const paintStatic = () => {
      if (!ctx) return
      if (ctx.renderStatic) ctx.renderStatic()
      else ctx.render(0)
    }

    // ── GL resources (rebuildable on context restore) ──────────────────────
    let ro = null
    let onContextLost = null
    let onContextRestored = null

    const buildGl = () => {
      ctx = setup(container)
      if (!ctx) return
      ctx.resize?.()

      ro = new ResizeObserver(() => ctx?.resize?.())
      ro.observe(container)

      onContextLost = (e) => {
        // preventDefault is required for the browser to fire `restored`. Stop
        // the loop; we rebuild from scratch on restore rather than attempting a
        // partial ogl recovery.
        e.preventDefault()
        stop()
      }
      onContextRestored = () => {
        teardownGl()
        buildGl()
        if (reduced) paintStatic()
        else sync()
      }
      ctx.canvas?.addEventListener('webglcontextlost', onContextLost)
      ctx.canvas?.addEventListener('webglcontextrestored', onContextRestored)
    }

    const teardownGl = () => {
      stop()
      ro?.disconnect()
      ro = null
      if (ctx?.canvas) {
        ctx.canvas.removeEventListener('webglcontextlost', onContextLost)
        ctx.canvas.removeEventListener('webglcontextrestored', onContextRestored)
      }
      ctx?.dispose?.()
      ctx = null
    }

    buildGl()

    // ── Lifecycle signals (stable across GL rebuilds — observe the container) ─
    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
      sync()
    }, { rootMargin: `${ROOT_MARGIN_PX}px` })
    io.observe(container)

    const onVisibility = () => { tabVisible = !document.hidden; sync() }
    document.addEventListener('visibilitychange', onVisibility)

    const unsubscribeModal = subscribeToModalOpen(() => { modalOpen = getModalOpen(); sync() })

    const onReducedChange = (e) => {
      reduced = e.matches
      if (reduced) { stop(); paintStatic() }
      else sync()
    }
    mq.addEventListener('change', onReducedChange)

    // Initial paint.
    if (reduced) paintStatic()
    else sync()

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      unsubscribeModal()
      mq.removeEventListener('change', onReducedChange)
      teardownGl()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps) // react-doctor-disable-line react-doctor/exhaustive-deps
}

function isWithinViewport(el) {
  const rect = el.getBoundingClientRect()
  const vh = window.innerHeight || document.documentElement.clientHeight
  const vw = window.innerWidth || document.documentElement.clientWidth
  return (
    rect.bottom > -ROOT_MARGIN_PX &&
    rect.top < vh + ROOT_MARGIN_PX &&
    rect.right > -ROOT_MARGIN_PX &&
    rect.left < vw + ROOT_MARGIN_PX
  )
}
