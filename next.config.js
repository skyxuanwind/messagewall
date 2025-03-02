/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'socket.io-client'];
    return config;
  },
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig; 