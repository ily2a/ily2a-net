'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'

const DarkVeil = dynamic(() => import('@/components/DarkVeil'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(135deg, #0D1012 0%, #2e2937 60%, #484257 100%)',
    }} />
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
    <section id="testimonials" className="testimonials-section" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* ── WebGL background ── */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <DarkVeil
          hueShift={0}
          speed={0.3}
          warpAmount={0.6}
          noiseIntensity={0.025}
          scanlineIntensity={0}
          resolutionScale={0.6}
        />
        {/* brand color overlay: forces amethyst palette onto CPPN luminance */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #2e2937 0%, #6c6284 50%, #484257 100%)',
          mixBlendMode: 'color',
        }} />
        {/* dark tint so glass cards stay readable */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(13, 16, 18, 0.3)',
        }} />
      </div>

      {/* ── Content ── */}
      <div className="testimonials-inner" style={{ position: 'relative', zIndex: 1 }}>
        <div className="testimonials-header">
          <h2 className="testimonials-title">Echoes about me</h2>
          <p className="text-md testimonials-subtitle">
            While some of my client reviews are NDA-protected (because, you know, top-secret
            agency white label stuff), I managed to sneak in a few favorites from my previous partners.
          </p>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map(({ name, role, avatar, quote, wide }) => (
            <article
              key={name}
              className={`testimonial-card${wide ? ' testimonial-card--wide' : ''}`}
            >
              <div className="testimonial-author">
                <Image
                  src={avatar}
                  alt={`${name}, ${role}`}
                  width={44}
                  height={44}
                  className="testimonial-avatar"
                />
                <div className="testimonial-meta">
                  <span className="testimonial-name">{name}</span>
                  <span className="testimonial-role">{role}</span>
                </div>
              </div>
              <p className="testimonial-quote">{quote}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
