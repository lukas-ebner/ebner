import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageBuilder } from '@/components/PageBuilder'
import { ThemenPageLayout } from '@/components/layouts/ThemenPageLayout'
import { listPageSlugs, loadPage } from '@/lib/page-builder'
import { isLandingPageThemenFormat, loadLandingPageAsThemen } from '@/lib/themen'
import { JsonLd, contentPageSchema } from '@/lib/schema'

const defaultOgImage = 'https://cloud.fracto.live/s/a4CyLxG27RgGjRJ/preview'

const canonicalSlugMap: Record<string, string> = {
  'change-management-beratung': 'change-management-beratung',
  'change-management-beratung-regensburg': 'change-management-beratung',
}

function canonicalPathForSlug(slug: string) {
  const canonicalSlug = canonicalSlugMap[slug] ?? slug
  return `https://lukasebner.de/${canonicalSlug}`
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return listPageSlugs()
    .filter((slug) => slug !== 'homepage')
    .map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (slug === 'homepage') return {}

  // Themen-Format pages
  if (isLandingPageThemenFormat(slug)) {
    try {
      const page = loadLandingPageAsThemen(slug)
      const canonicalUrl = canonicalPathForSlug(slug)
      const ogImage = page.meta.og_image
        ? `https://lukasebner.de${page.meta.og_image}`
        : defaultOgImage
      return {
        title: page.meta.title,
        description: page.meta.description,
        alternates: { canonical: canonicalUrl },
        openGraph: {
          type: 'website',
          url: canonicalUrl,
          title: page.meta.title,
          description: page.meta.description,
          images: [{ url: ogImage }],
        },
        twitter: {
          card: 'summary_large_image',
          title: page.meta.title,
          description: page.meta.description,
          images: [ogImage],
        },
      }
    } catch {
      return {}
    }
  }

  // Slide-based pages
  try {
    const page = loadPage(slug)
    const canonicalUrl = canonicalPathForSlug(slug)
    const ogImage =
      slug === 'change-management-beratung' && page.meta.og_image
        ? `https://lukasebner.de${page.meta.og_image}`
        : defaultOgImage

    return {
      title: page.meta.title,
      description: page.meta.description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: 'website',
        url: canonicalUrl,
        title: page.meta.title,
        description: page.meta.description,
        images: [{ url: ogImage }],
      },
      twitter: {
        card: 'summary_large_image',
        title: page.meta.title,
        description: page.meta.description,
        images: [ogImage],
      },
    }
  } catch {
    return {}
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params
  if (slug === 'homepage') notFound()

  // Themen-Format landing pages (sections-based)
  if (isLandingPageThemenFormat(slug)) {
    let themenPage
    try {
      themenPage = loadLandingPageAsThemen(slug)
    } catch {
      notFound()
    }
    const canonical = canonicalPathForSlug(slug).replace('https://lukasebner.de', '')
    return (
      <>
        <JsonLd
          data={contentPageSchema({
            slug,
            path: canonical,
            title: themenPage.meta.title,
            description: themenPage.meta.description,
            blocks: themenPage.sections,
          })}
        />
        <ThemenPageLayout page={themenPage} />
      </>
    )
  }

  // Slide-based pages (hero-split, symptoms-grid, etc.)
  let page
  try {
    page = loadPage(slug)
  } catch {
    notFound()
  }

  const canonicalPath = canonicalPathForSlug(slug).replace('https://lukasebner.de', '')
  const schema = contentPageSchema({
    slug,
    path: canonicalPath,
    title: page.meta.title,
    description: page.meta.description,
    blocks: page.slides,
  })

  return (
    <>
      <JsonLd data={schema} />
      <PageBuilder slides={page.slides} accent={page.meta.accent} noSnap={page.meta.noSnap} />
    </>
  )
}
