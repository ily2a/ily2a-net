'use client'

const GlassSurface = ({
  children,
  width = '100%',
  height = 64,
  borderRadius = 12,
  className = '',
  style = {},
}) => (
  <div
    className={`relative overflow-hidden ${className}`}
    style={{
      ...style,
      width:  typeof width  === 'number' ? `${width}px`  : width,
      height: typeof height === 'number' ? `${height}px` : height,
      borderRadius: `${borderRadius}px`,
      background: 'var(--color-surface-blur)',
      backdropFilter:       'blur(24px) saturate(160%)',
      WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      boxShadow: 'var(--shadow-glass)',
    }}
  >
    <div className="relative flex items-center justify-center w-full h-full" style={{ zIndex: 1 }}>
      {children}
    </div>
  </div>
)

export default GlassSurface
