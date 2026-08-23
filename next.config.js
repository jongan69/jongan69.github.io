/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    '/': ['./index.html', './index.md'],
    '/[...path]': ['./404.html', './404.md'],
  },
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
  async rewrites() {
    return {
      beforeFiles: ['YouTubeResearchAI', 'opendating-mobile', 'privacy-policy'].map((path) => ({
        source: `/${path}/:path*`,
        destination: `https://pages.jongan.com/${path}/:path*`,
      })),
    };
  },
};

export default nextConfig;
