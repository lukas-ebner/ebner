import path from 'path'
import { fileURLToPath } from 'url'
import type { NextConfig } from 'next'

/** Verzeichnis dieser Datei = App-Root (wichtig bei mehreren lockfiles im Parent-Ordner). */
const projectRoot = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: projectRoot,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Externe Domains bei Bedarf:
    // remotePatterns: [{ protocol: 'https', hostname: 'example.com', pathname: '/**' }],
  },
  redirects: async () => [
    {
      source: '/:path*',
      has: [
        {
          type: 'host',
          value: 'www.lukasebner.de',
        },
      ],
      destination: 'https://lukasebner.de/:path*',
      permanent: true,
    },
  ],
}

export default nextConfig
