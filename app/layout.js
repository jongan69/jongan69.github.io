export const metadata = {
  title: "Jonathan Gan — Mobile Systems Engineer",
  description: "Production mobile systems spanning on-device AI, native cameras, iOS, Android, and watchOS.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Jonathan Gan — Mobile Systems Engineer",
    description: "Difficult hardware, made inevitable. Production mobile systems spanning on-device AI, native cameras, iOS, Android, and watchOS.",
    url: "https://jongan.com/",
    siteName: "Jonathan Gan",
    images: [
      {
        url: "https://jongan.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Jonathan Gan — Mobile Systems Engineer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jonathan Gan — Mobile Systems Engineer",
    description: "Difficult hardware, made inevitable. Production mobile systems spanning on-device AI, native cameras, iOS, Android, and watchOS.",
    images: ["https://jongan.com/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
