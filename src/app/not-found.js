import Link from 'next/link'
import FloatingNav from '@/components/nav/FloatingNav'
import SilentErrorBoundary from '@/components/errors/SilentErrorBoundary'
import NotFoundPasswordBg from '@/components/backgrounds/NotFoundPasswordBg'

export const metadata = {
  title: '404 — Page not found | Ily Ameur',
  description: 'The page you tried to reach does not exist. Head back to the homepage.',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <main id="main-content" className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <NotFoundPasswordBg />

      <SilentErrorBoundary><FloatingNav /></SilentErrorBoundary>

      <div className="flex flex-col items-center gap-6 p-8 text-center">
        <h1 className="heading-page text-text-primary">
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
