/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@echodesk/types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    outputFileTracingExcludes: {
      '*': ['node_modules/@swc/core*'],
    },
  },
}

module.exports = nextConfig