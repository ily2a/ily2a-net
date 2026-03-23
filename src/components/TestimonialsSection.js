'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'

const DarkVeil = dynamic(() => import('@/components/DarkVeil'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-background via-amethyst-950 to-amethyst-900" />
  ),
})

const TESTIMONIALS = [
  {
    name: 'Ali Abdulkadir Ali',
    role: 'CPO @ Shamaazi',
    avatar: '/Avatars/ali.jpg',
    quote:
      "Ily joined Shamaazi as our sole Product Designer and immediately became an invaluable team member. He grasped our product quickly, made impactful improvements from the start, and redesigned our donor journey to create a smooth, intuitive flow. When we collaborated on our first charity dashboard, his thoughtful design ensured clarity and usability. Ily's creativity, attention to detail, and collaborative spirit make him a fantastic asset to any team. Highly recommended!",
    wide: true,
  },
  {
    name: 'Oliver Joest',
    role: 'Head of Development @ L-mobile',
    avatar: '/Avatars/oliver.jpg',
    quote:
      'We have been working with Ily on our B2B software application for Field Service Management. He established thorough design principles and helped us understand the challenges and needs of user interface and user experience design. He is keen on questioning existing pieces as well as providing great ideas for new designs. He is a dedicated and extrovert person that knows his craft. He is well networked and keeps his knowledge up-to date by following latest trends.',
    wide: true,
  },
  {
    name: 'Gabriel Gaudin',
    role: 'Product Owner @ Meeting Potes',
    avatar: '/Avatars/gabriel.jpg',
    quote:
      'Ily was in charge of building the entire design system for our product and he did it brilliantly. This stage was necessary for further development and he was very quickly involved in the project. He reacts quickly to our requests and saved us precious time. Thank you for your work, Ily !',
    wide: false,
  },
  {
    name: 'Anouar Cheikhrouhou',
    role: 'Manager @ Wevioo',
    avatar: '/Avatars/anouar.jpg',
    quote:
      'Ily is a talented product designer with a strong track record. At Wevioo, he excelled in leading design projects from concept to launch for clients like Thales and the Ministry of Tech. His expertise in UX, prototyping, and design systems made him a valuable asset to our team. I highly recommend him for any product design role.',
    wide: false,
  },
]

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="w-full relative overflow-hidden flex justify-center px-4 py-7 tab:px-10 tab:py-8 desk:px-14 desk:py-10 xl:px-20"
    >
      {/* ── WebGL background ── */}
      <div aria-hidden="true" className="absolute inset-0 z-0">
        <DarkVeil
          hueShift={0}
          speed={0.3}
          warpAmount={0.6}
          noiseIntensity={0.025}
          scanlineIntensity={0}
          resolutionScale={0.6}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amethyst-950 via-amethyst-700 to-amethyst-900 mix-blend-color" />
        <div className="absolute inset-0 bg-background/30" />
      </div>

      {/* ── Content ── */}
      <div className="w-full max-w-[600px] relative z-[1] flex flex-col gap-8 tab:max-w-none xl:max-w-[1440px]">
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-[20px] xl:text-2xl text-text-primary tracking-[-0.01em]">Echoes about me</h2>
          <p className="text-md text-text-secondary">
            While some of my client reviews are NDA-protected (because, you know, top-secret
            agency white label stuff), I managed to sneak in a few favorites from my previous partners.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[600px]:grid-cols-2">
          {TESTIMONIALS.map(({ name, role, avatar, quote, wide }) => (
            <article
              key={name}
              className={`testimonial-card rounded-xl${wide ? ' col-span-full' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Image
                  src={avatar}
                  alt={`${name}, ${role}`}
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-full object-cover shrink-0"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-[15px] text-text-primary tracking-[-0.01em] leading-[1.2]">{name}</span>
                  <span className="text-[13px] text-text-secondary tracking-[0.02em] leading-[1.3]">{role}</span>
                </div>
              </div>
              <p className="text-text-primary text-[14px] desk:text-[15px] xl:text-base leading-[160%] tracking-[0.02em]">{quote}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
