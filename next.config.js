/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'blog.jongan.com' }],
        destination: 'https://medium.com/@jonngan',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'video.jongan.com' }],
        destination: 'https://www.youtube.com/@jonngan',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
