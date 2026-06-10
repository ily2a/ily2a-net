// Shared validation constants — import these instead of duplicating inline.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

// Contact form length caps. Mirrored by the server in src/app/api/contact/route.ts
// so client and server reject the same inputs and error messages stay useful.
export const CONTACT_MAX = {
  name:    100,
  email:   254,
  message: 5000,
}
