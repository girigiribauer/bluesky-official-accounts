/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 600,
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    serverComponentsExternalPackages: ["@atproto/oauth-client-node"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.bsky.app",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: '/features',
        destination: '/',
        permanent: true,
      },
    ];
  },

  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  swcMinify: false,
};

export default nextConfig;
