/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.VERCEL ? undefined : 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  }
};

export default nextConfig;


