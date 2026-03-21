import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `${slug} – Blog`,
    description: 'MDX-Artikel folgt.',
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  if (!slug) notFound()

  return (
    <article className="mx-auto max-w-3xl px-6 py-section-desktop">
      <h1 className="font-display text-h1 font-normal capitalize text-text-primary">
        {slug.replace(/-/g, ' ')}
      </h1>
      <p className="mt-4 font-body text-body text-text-muted">
        MDX-Inhalt für diesen Beitrag wird später angebunden.
      </p>
      <p className="mt-8">
        <Link href="/blog" className="font-display font-semibold text-brand hover:underline">
          Zur Blog-Übersicht
        </Link>
      </p>
    </article>
  )
}
