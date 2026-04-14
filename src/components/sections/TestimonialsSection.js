import Image from 'next/image'
import { TESTIMONIALS } from '@/data/testimonials'
import TestimonialsBg from '@/components/backgrounds/TestimonialsBg'


export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="w-full relative overflow-hidden flex justify-center px-4 py-7 tab:px-10 tab:py-8 desk:px-14 desk:py-10 xl:px-20"
    >
      {/* ── WebGL background ── */}
      <TestimonialsBg />

      {/* ── Content ── */}
      <div className="w-full max-w-[600px] relative z-[1] flex flex-col gap-5 tab:gap-8 tab:max-w-none xl:max-w-[1440px]">
        <div className="flex flex-col gap-2">
          <h2 className="heading-section text-text-primary">Echoes about me</h2>
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
                  sizes="44px"
                  className="w-11 h-11 rounded-full object-cover shrink-0"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-testimonial-name text-text-primary">{name}</span>
                  <span className="text-testimonial-role text-text-secondary">{role}</span>
                </div>
              </div>
              <p className="text-body-card text-text-primary">{quote}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
