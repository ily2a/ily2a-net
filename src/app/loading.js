export default function Loading() {
  return (
    <main>
      {/* ── Hero skeleton ── */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="flex flex-col gap-6 w-full max-w-[680px]">
            <div className="skeleton h-14 w-64 rounded-lg" />
            <div className="flex flex-col gap-3">
              <div className="skeleton h-7 w-full rounded-lg" />
              <div className="skeleton h-5 w-3/4 rounded-lg" />
            </div>
            <div className="flex gap-3">
              <div className="skeleton h-[60px] w-[140px] rounded-lg" />
              <div className="skeleton h-[60px] w-[160px] rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Work section skeleton ── */}
      <section className="work-section">
        <div className="work-inner">
          <div className="work-header-block">
            <div className="work-header">
              <div className="skeleton h-6 w-24 rounded" />
            </div>
          </div>
          <div className="work-grid">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton w-full rounded-xl" style={{ aspectRatio: '16/10' }} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
