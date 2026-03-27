import type { Metadata } from 'next'
import { PageBuilder } from '@/components/PageBuilder'
import { loadPage } from '@/lib/page-builder'
import { listPublishedPosts, CATEGORY_LABELS } from '@/lib/blog'

export async function generateMetadata(): Promise<Metadata> {
  const page = loadPage('homepage')
  return {
    title: page.meta.title,
    description: page.meta.description,
    openGraph: {
      type: 'website',
      url: 'https://lukasebner.de',
      title: page.meta.title,
      description: page.meta.description,
      ...(page.meta.og_image ? { images: [{ url: page.meta.og_image }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: page.meta.title,
      description: page.meta.description,
    },
  }
}

export default function HomePage() {
  const page = loadPage('homepage')

  // Inject latest blog post into blog-teaser slide
  const posts = listPublishedPosts()
  if (posts.length > 0) {
    const latest = posts[0] // already sorted by date desc
    page.slides = page.slides.map((slide) => {
      if (slide.template === 'blog-teaser') {
        return {
          ...slide,
          post: {
            title: latest.title,
            excerpt: latest.description,
            date: new Date(latest.date).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }),
            category: CATEGORY_LABELS[latest.category] || latest.category,
            image: latest.image || '',
            url: `/blog/${latest.slug}`,
          },
        }
      }
      return slide
    })
  }

  return <PageBuilder slides={page.slides} accent={page.meta.accent} />
}
