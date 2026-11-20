import path from 'path'
import { fileURLToPath } from 'url'
import type { NextConfig } from 'next'
import { listThemenSlugs } from './lib/themen'

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
  redirects: async () => {
    // Alte Pfade → Ziel. Für www.lukasebner.de zusätzlich direkt aufs Ziel leiten (ein Hop statt www → apex → Ziel).
    const moved = [
      { source: '/bafa', destination: '/themen/bafa' },
      { source: '/change-management-beratung', destination: '/themen/change-management-beratung' },
      ...listThemenSlugs().map((slug) => ({ source: `/${slug}`, destination: `/themen/${slug}` })),
    ].filter((r, i, all) => all.findIndex((x) => x.source === r.source) === i)

    return [
      ...moved.map((r) => ({
        source: r.source,
        has: [{ type: 'host' as const, value: 'www.lukasebner.de' }],
        destination: `https://lukasebner.de${r.destination}`,
        permanent: true,
      })),
      {
        source: '/:path*',
        has: [{ type: 'host' as const, value: 'www.lukasebner.de' }],
        destination: 'https://lukasebner.de/:path*',
        permanent: true,
      },
      ...moved.map((r) => ({ ...r, permanent: true })),
    ]
  },
}

export default nextConfig
