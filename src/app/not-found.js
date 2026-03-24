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
        <h1 className="font-medium tracking-[0.06em] leading-[140%] text-[24px] md:text-[28px] lg:text-[26px] xl:text-[32px] text-balance text-text-primary">
          This page faded into the digital ether.<br />
          Hit the homepage and keep exploring.
        </h1>
        <Link
          href="/"
          className="font-bold tracking-[-0.01em] leading-[120%] text-[16px] lg:text-[18px] text-balance text-brand underline"
        >
          Back home
        </Link>
      </div>
    </main>
  )
}
