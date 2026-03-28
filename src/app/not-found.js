import Link from 'next/link'
import FloatingNav from '@/components/FloatingNav'
import LineWavesBackground from '@/components/LineWavesBackground'

export const metadata = {
  title: '404 — Page not found | Ily Ameur',
}

export default function NotFound() {
  return (
    <main className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <LineWavesBackground />

      <FloatingNav />

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
