import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageBuilder } from '@/components/PageBuilder'
import { listPageSlugs, loadPage } from '@/lib/page-builder'

const defaultOgImage = 'https://cloud.fracto.live/s/a4CyLxG27RgGjRJ/preview'

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
    return {
      title: page.meta.title,
      description: page.meta.description,
      alternates: {
        canonical: `https://lukasebner.de/${slug}`,
      },
      openGraph: {
        type: 'website',
        url: `https://lukasebner.de/${slug}`,
        title: page.meta.title,
        description: page.meta.description,
        images: [{ url: defaultOgImage }],
      },
      twitter: {
        card: 'summary_large_image',
        title: page.meta.title,
        description: page.meta.description,
        images: [defaultOgImage],
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

  return <PageBuilder slides={page.slides} accent={page.meta.accent} noSnap={page.meta.noSnap} />
}
