/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/mainstream',
        destination: '/professions',
        permanent: true,
      },
      {
        source: '/demo',
        destination: '/keynote',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
  // This will ignore ESLint errors during the build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
