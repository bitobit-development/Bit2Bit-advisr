/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true
  },
  images: {
    unoptimized: true
  },
  // Add webpack config to handle window is not defined error
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, 'canvas']
    }
    return config
  },
  // Disable static optimization for pages with browser API dependencies
  reactStrictMode: true,
  output: 'standalone'
}

module.exports = nextConfig