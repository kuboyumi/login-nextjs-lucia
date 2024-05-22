/** @type {import('next').NextConfig} */

const nextConfig = {
  webpack: (config) => {
    config.externals = 'bun:sqlite';
    return config;
  },
};

export default nextConfig;
