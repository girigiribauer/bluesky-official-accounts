/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 600,
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["@atproto/oauth-client-node"],

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
};

export default nextConfig;
