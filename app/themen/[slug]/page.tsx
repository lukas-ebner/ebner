import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ThemenPageLayout } from '@/components/layouts/ThemenPageLayout'
import { listThemenSlugs, loadThemenPage } from '@/lib/themen'
import { JsonLd, contentPageSchema } from '@/lib/schema'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return listThemenSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const page = loadThemenPage(slug)
    const canonical = `https://lukasebner.de/themen/${slug}`
    const ogImage = page.meta.og_image ? `https://lukasebner.de${page.meta.og_image}` : undefined

    return {
      title: page.meta.title,
      description: page.meta.description,
      alternates: { canonical },
      openGraph: {
        type: 'article',
        url: canonical,
        title: page.meta.title,
        description: page.meta.description,
        images: ogImage ? [{ url: ogImage }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: page.meta.title,
        description: page.meta.description,
        images: ogImage ? [ogImage] : undefined,
      },
    }
  } catch {
    return {}
  }
}

export default async function ThemenDetailPage({ params }: PageProps) {
  const { slug } = await params

  let page
  try {
    page = loadThemenPage(slug)
  } catch {
    notFound()
  }

  const jsonLd = contentPageSchema({
    slug,
    path: `/themen/${slug}`,
    title: page.meta.title,
    description: page.meta.description,
    blocks: page.sections,
    isArticle: true,
  })

  return (
    <>
      <JsonLd data={jsonLd} />
      <ThemenPageLayout page={page} />
    </>
  )
}
