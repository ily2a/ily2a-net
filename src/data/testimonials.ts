export interface Testimonial {
  name: string
  role: string
  avatar: string
  quote: string
  wide: boolean
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name:   'Matt White',
    role:   'Creator Product Director @ Genflow',
    avatar: '/Avatars/matt.webp',
    quote:
      'Ily joined us to strengthen our design systems and bring more consistency across our products, and he delivered on both quickly. He has a strong grasp of design principles and practical implementation, translating ideas into concrete improvements that raised the quality and coherence of the projects he worked on. He was also highly effective working with developers, making sure design systems were well thought through and properly built in practice. That ability to work across design and engineering, while staying pragmatic and focused on delivery, made an immediate difference. Ily would be a strong addition to any team looking to raise the bar on design systems and user experience.',
    wide: true,
  },
  {
    name:   'Ali Abdulkadir Ali',
    role:   'CPO @ Shamaazi',
    avatar: '/Avatars/ali.webp',
    quote:
      "Ily joined Shamaazi as our sole Product Designer and immediately became an invaluable team member. He grasped our product quickly, made impactful improvements from the start, and redesigned our donor journey to create a smooth, intuitive flow. When we collaborated on our first charity dashboard, his thoughtful design ensured clarity and usability. Ily's creativity, attention to detail, and collaborative spirit make him a fantastic asset to any team. Highly recommended!",
    wide: true,
  },
  {
    name:   'Oliver Joest',
    role:   'Head of Development @ L-mobile',
    avatar: '/Avatars/oliver.webp',
    quote:
      'We worked with Ily on our B2B Field Service Management application. He established thorough design principles and helped us understand the real challenges of UI and UX design. He questions existing pieces while offering great new ideas. A dedicated pro who knows his craft and stays current.',
    wide: false,
  },
  {
    name:   'Gabriel Gaudin',
    role:   'Product Owner @ Meeps',
    avatar: '/Avatars/gabriel.webp',
    quote:
      'Ily was in charge of building the entire design system for our product and he did it brilliantly. This stage was necessary for further development and he was very quickly involved in the project. He reacts quickly to our requests and saved us precious time. Thank you for your work, Ily !',
    wide: false,
  },
]
