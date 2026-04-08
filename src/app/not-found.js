import Link from 'next/link'
import FloatingNav from '@/components/nav/FloatingNav'
import SilentErrorBoundary from '@/components/SilentErrorBoundary'
import LineWavesBackground from '@/components/backgrounds/LineWavesBackground'

export const metadata = {
  title: '404 — Page not found | Ily Ameur',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <main className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <LineWavesBackground />

      <SilentErrorBoundary><FloatingNav /></SilentErrorBoundary>

      <div className="flex flex-col items-center gap-6 p-8 text-center">
        <h1 className="text-intro text-text-primary">
          This page faded into the digital ether.<br />
          Hit the homepage and keep exploring.
        </h1>
        <Link
          href="/"
          className="btn-label text-brand underline"
        >
          Back home
        </Link>
      </div>
    </main>
  )
}
