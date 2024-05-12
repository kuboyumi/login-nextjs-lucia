/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push('bun:sqlite');
    return config;
  },
};

export default nextConfig;
