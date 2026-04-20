import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageBuilder } from '@/components/PageBuilder'
import { listPageSlugs, loadPage } from '@/lib/page-builder'

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

  let page
  try {
    page = loadPage(slug)
  } catch {
    notFound()
  }

  const canonicalUrl = canonicalPathForSlug(slug)
  const isChangeManagementPage = slug === 'change-management-beratung' || slug === 'change-management-beratung-regensburg'

  const serviceSchema = isChangeManagementPage
    ? {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Change Management Beratung',
        serviceType: 'Change Management Beratung für KMU',
        provider: {
          '@type': 'Organization',
          name: 'Lukas Ebner',
          url: 'https://lukasebner.de',
        },
        areaServed: ['Regensburg', 'Oberpfalz', 'Ostbayern'],
        url: canonicalUrl,
        description: page.meta.description,
      }
    : null

  return (
    <>
      {serviceSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
      ) : null}
      <PageBuilder slides={page.slides} accent={page.meta.accent} noSnap={page.meta.noSnap} />
    </>
  )
}
