import type { MetadataRoute } from 'next'
import { NOINDEX_PAGE_SLUGS, listPageSlugs } from '@/lib/page-builder'
import { listPublishedPosts } from '@/lib/blog'
import { listThemenSlugs } from '@/lib/themen'

const BASE = 'https://lukasebner.de'

export default function sitemap(): MetadataRoute.Sitemap {
  // Kein künstliches "jetzt" als lastModified: Suchmaschinen ignorieren das Signal sonst.
  // Blog nutzt echte Daten aus dem Frontmatter, Startseite/Blog-Index das jüngste Artikeldatum.
  const posts = listPublishedPosts()
  const latestPost = posts[0]?.updated ?? posts[0]?.date
  const now = latestPost ? new Date(latestPost).toISOString() : undefined

  const homepage: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]

  const migratedToThemen = new Set(['bafa', 'change-management-beratung'])

  const lowPriority = new Set(['impressum', 'datenschutz'])
  const pages: MetadataRoute.Sitemap = [
    ...listPageSlugs().filter(
      (slug) => slug !== 'homepage' && !migratedToThemen.has(slug) && !NOINDEX_PAGE_SLUGS.has(slug),
    ),
    'kurzprofil',
    'literatur',
  ].map((slug) => ({
    url: `${BASE}/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: lowPriority.has(slug) ? 0.2 : slug === 'ueber-mich' ? 0.9 : 0.8,
  }))

  const leadmagnet: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/unverzichtbar`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ]

  const themenPages: MetadataRoute.Sitemap = listThemenSlugs().map((slug) => ({
    url: `${BASE}/themen/${slug}`,
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

  const blogPosts: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.date).toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...homepage, ...pages, ...leadmagnet, ...themenPages, ...blogIndex, ...blogPosts]
}
