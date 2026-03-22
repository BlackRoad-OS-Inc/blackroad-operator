/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  output: 'standalone',
  env: {
    DEPLOYMENT_TARGET: process.env.DEPLOYMENT_TARGET || 'production'
  }
}

module.exports = nextConfig
