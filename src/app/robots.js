export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/studio' },
    ],
    sitemap: 'https://ily2a.net/sitemap.xml',
  }
}
