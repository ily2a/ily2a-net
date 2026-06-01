// Visual half of the cursor-spotlight effect. Paints a radial gradient at the
// --mx / --my position that useSpotlight writes on pointer move. Co-located so
// the gradient radius/color live in one place rather than being hand-copied
// into every consumer (SpotlightButton, BackToTop, …).
export default function SpotlightLayer() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ background: 'radial-gradient(circle 80px at var(--mx, 50%) var(--my, 50%), var(--color-spotlight), transparent)' }}
    />
  )
}
