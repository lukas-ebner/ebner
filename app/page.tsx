import type { Metadata } from 'next'
import { PageBuilder } from '@/components/PageBuilder'
import { loadPage } from '@/lib/page-builder'

export async function generateMetadata(): Promise<Metadata> {
  const page = loadPage('homepage')
  return {
    title: page.meta.title,
    description: page.meta.description,
    openGraph: page.meta.og_image
      ? { images: [{ url: page.meta.og_image }] }
      : undefined,
  }
}

export default function HomePage() {
  const page = loadPage('homepage')
  return <PageBuilder slides={page.slides} accent={page.meta.accent} />
}
