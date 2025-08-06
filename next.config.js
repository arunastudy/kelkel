/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['res.cloudinary.com', 'wallpapers.com', 'i.ibb.co'],
  },
  experimental: {
    serverComponentsExternalPackages: ['cloudinary', '@prisma/client', 'prisma']
  },
  webpack: (config) => {
    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.fallback) {
      config.resolve.fallback = {};
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      stream: false,
      crypto: false,
      os: false,
      http: false,
      https: false,
      zlib: false,
      net: false,
      tls: false,
      child_process: false,
      'cloudinary-core': false
    };
    return config;
  },
  typescript: {
    ignoreBuildErrors: true
  },
  env: {
    IMGBB_API_KEY: process.env.IMGBB_API_KEY,
  }
}

module.exports = nextConfig