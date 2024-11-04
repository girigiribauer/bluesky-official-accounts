/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 600,
  output: "export",
  images: { unoptimized: true },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
