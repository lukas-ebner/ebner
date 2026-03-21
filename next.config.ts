import path from 'path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Externe Domains bei Bedarf:
    // remotePatterns: [{ protocol: 'https', hostname: 'example.com', pathname: '/**' }],
  },
}

export default nextConfig
