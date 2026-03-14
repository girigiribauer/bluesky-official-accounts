/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 600,

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
