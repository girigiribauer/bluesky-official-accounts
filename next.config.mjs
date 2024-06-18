/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
