import type { CSSProperties, ReactNode } from 'react'

// Stable empty default so an omitted `style` prop keeps the same reference
// across renders instead of allocating a fresh object each time.
const EMPTY_STYLE: CSSProperties = {}

interface GlassSurfaceProps {
  children?: ReactNode
  width?: number | string
  height?: number | string
  borderRadius?: number | string
  className?: string
  style?: CSSProperties
}

const GlassSurface = ({
  children,
  width = '100%',
  height = 64,
  borderRadius = 12,
  className = '',
  style = EMPTY_STYLE,
}: GlassSurfaceProps) => (
  <div
    className={`relative overflow-hidden bg-surface/35 backdrop-blur-[20px] backdrop-saturate-300 shadow-[inset_0_1px_0_0_var(--color-glass-border),inset_0_-1px_0_0_var(--color-glass-bg)] ${className}`}
    style={{
      ...style,
      width:        typeof width        === 'number' ? `${width}px`        : width,
      height:       typeof height       === 'number' ? `${height}px`       : height,
      borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    }}
  >
    <div className="relative z-[1] flex items-center justify-center w-full h-full">
      {children}
    </div>
  </div>
)

export default GlassSurface
