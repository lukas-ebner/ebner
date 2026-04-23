import type { MetadataRoute } from 'next'
import { listPageSlugs } from '@/lib/page-builder'
import { listBlogSlugs } from '@/lib/blog'
import { listThemenSlugs } from '@/lib/themen'

const BASE = 'https://lukasebner.de'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  const homepage: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]

  const migratedToThemen = new Set(['bafa', 'change-management-beratung'])

  const pages: MetadataRoute.Sitemap = listPageSlugs()
    .filter((slug) => slug !== 'homepage' && !migratedToThemen.has(slug))
    .map((slug) => ({
      url: `${BASE}/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  const leadmagnet: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/unverzichtbar`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ]

  const themenPages: MetadataRoute.Sitemap = listThemenSlugs().map((slug) => ({
    url: `${BASE}/themen/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const blogIndex: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  const blogPosts: MetadataRoute.Sitemap = listBlogSlugs().map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...homepage, ...pages, ...leadmagnet, ...themenPages, ...blogIndex, ...blogPosts]
}
