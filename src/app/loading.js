export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading page content">
      <p className="sr-only">Loading, please wait…</p>
      {/* ── Hero skeleton ── */}
      <section className="relative h-screen">
        <div className="relative z-10 flex justify-center pt-[120px] px-5 pb-7 md:pt-[88px] md:px-10 md:pb-6 lg:px-16 lg:pb-16">
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
      <section className="w-full flex justify-center px-4 py-7 min-[730px]:px-10 min-[730px]:py-8 min-[1088px]:px-14 min-[1088px]:py-10 xl:px-20">
        <div className="w-full max-w-[600px] flex flex-col gap-8 min-[730px]:max-w-none xl:max-w-[1440px]">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <div className="skeleton h-6 w-24 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 min-[600px]:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton w-full rounded-xl aspect-[16/10]" />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
