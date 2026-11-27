'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { asset, Logo, PrimaryButton, SecondaryButton } from '../ui'

export function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1400)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <button
      type="button"
      onClick={onDone}
      aria-label="Lean. Tap to continue"
      className="absolute inset-0 flex items-center justify-center bg-(--lean-bg-screen)"
    >
      <Logo size="splash" />
    </button>
  )
}

export function Welcome({ onSignup, onLogin }: { onSignup: () => void; onLogin: () => void }) {
  return (
    <div className="absolute inset-0">
      <Image src={asset('welcome.png')} alt="" fill priority sizes="375px" className="object-cover" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <h2 className="sr-only">Welcome to Lean</h2>
        <Logo size="welcome" />
      </div>
      <div className="absolute top-[571.5px] left-1/2 flex w-[343px] -translate-x-1/2 flex-col items-center gap-5">
        <SecondaryButton onClick={onSignup}>Sign up</SecondaryButton>
        <p className="text-[14px] leading-5 font-bold text-(--lean-text-inverse)">OR</p>
        <PrimaryButton onClick={onLogin}>Login</PrimaryButton>
      </div>
    </div>
  )
}
