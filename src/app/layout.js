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
      <body>{children}</body>
    </html>
  );
}