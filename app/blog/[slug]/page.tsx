import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { loadBlogPost, listBlogSlugs, CATEGORY_COLORS } from '@/lib/blog'
import { NoSnap } from '@/components/NoSnap'
import { BlogContent } from '@/components/BlogContent'

const defaultOgImage = 'https://cloud.fracto.live/s/a4CyLxG27RgGjRJ'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return listBlogSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const post = loadBlogPost(slug)
    return {
      title: `${post.meta.title} – Lukas Ebner`,
      description: post.meta.description,
      keywords: [post.meta.keyword, ...(post.meta.nebenkeywords ?? [])].join(', '),
      alternates: {
        canonical: `https://lukasebner.de/blog/${slug}`,
      },
      openGraph: {
        type: 'article',
        url: `https://lukasebner.de/blog/${slug}`,
        title: `${post.meta.title} – Lukas Ebner`,
        description: post.meta.description,
        images: [{ url: post.meta.image || defaultOgImage }],
        publishedTime: post.meta.date,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${post.meta.title} – Lukas Ebner`,
        description: post.meta.description,
        images: [post.meta.image || defaultOgImage],
      },
    }
  } catch {
    return {}
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  let post
  try {
    post = loadBlogPost(slug)
  } catch {
    notFound()
  }

  const { meta, content } = post
  const catColor = CATEGORY_COLORS[meta.category]

  return (
    <article className="min-h-screen bg-surface-light">
      <NoSnap />

      {/* Hero with image */}
      <div className="relative overflow-hidden" style={{ backgroundColor: catColor }}>
        {meta.image && (
          <div className="absolute inset-0">
            <Image
              src={meta.image}
              alt={meta.title}
              fill
              className="object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </div>
        )}
        <div className="relative mx-auto max-w-3xl px-6 pb-16 pt-32 lg:pb-20 lg:pt-40">
          <h1 className="font-display text-[2rem] font-normal leading-[1.1] text-white md:text-[2.6rem] lg:text-[3rem]">
            {meta.title}
          </h1>
          <p className="mt-4 max-w-[600px] font-body text-lg leading-relaxed text-white/70">
            {meta.description}
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="font-mono text-xs text-white/50">
              {new Date(meta.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span className="font-mono text-xs uppercase tracking-widest text-white/50">
              {meta.keyword}
            </span>
          </div>

          {meta.status === 'draft' && (
            <div className="mt-6 rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-4 py-3">
              <p className="font-mono text-sm text-yellow-200">
                Dieser Artikel ist ein Entwurf und wird gerade geschrieben.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-16">
        <BlogContent content={content} />

        {/* CTA */}
        {meta.cta && (
          <div className="mt-16 rounded-xl border border-black/5 bg-white p-8 text-center shadow-sm">
            <p className="font-display text-xl text-text-primary">Bereit für den nächsten Schritt?</p>
            <Link
              href={meta.cta.url}
              className="mt-4 inline-block rounded-full border border-brand bg-brand px-6 py-3 font-display text-sm font-medium text-white transition-colors hover:bg-brand/90"
            >
              {meta.cta.text}
            </Link>
          </div>
        )}

        {/* Back */}
        <div className="mt-12 border-t border-black/5 pt-8">
          <Link
            href="/blog"
            className="font-display text-sm font-medium text-text-muted hover:text-brand transition-colors"
          >
            ← Alle Artikel
          </Link>
        </div>
      </div>
    </article>
  )
}
