export const metadata = {
  title: "jongan.com redirects",
  description: "Subdomain redirects to blog and video",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
