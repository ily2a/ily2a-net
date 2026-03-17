import "./globals.css";

export const metadata = {
  title: "Ily Ameur — Design Engineer",
  description: "I design systems, flows, and products. Then build them.",
  openGraph: {
    title: "Ily Ameur — Design Engineer",
    description: "I design systems, flows, and products. Then build them.",
    url: "https://ily2a.net",
    siteName: "Ily Ameur",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ily Ameur — Design Engineer",
    description: "I design systems, flows, and products. Then build them.",
  },
  metadataBase: new URL("https://ily2a.net"),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>{children}</body>
    </html>
  );
}