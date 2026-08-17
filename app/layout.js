export const metadata = {
  title: "jongan.com redirects",
  description: "Subdomain redirects to blog and video",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Jonathan Gan — React Native & Mobile Engineer",
    description: "AI, mobile, and camera systems engineer shipping production apps across iOS, Android, and watchOS.",
    url: "https://jongan.com/",
    siteName: "Jonathan Gan",
    images: [
      {
        url: "https://jongan.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Jonathan Gan — React Native & Mobile Engineer: AI apps, iOS, Android, watchOS, camera systems",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jonathan Gan — React Native & Mobile Engineer",
    description: "AI, mobile, and camera systems engineer shipping production apps across iOS, Android, and watchOS.",
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
