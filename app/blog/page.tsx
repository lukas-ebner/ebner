import type { Metadata } from 'next'
import Link from 'next/link'
import { listBlogPosts, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/blog'
import { NoSnap } from '@/components/NoSnap'

const defaultOgImage = 'https://cloud.fracto.live/s/a4CyLxG27RgGjRJ/preview'

export const metadata: Metadata = {
  title: 'Blog – Lukas Ebner',
  description:
    'Artikel zu Führung, Skalierung, Systeme, KI und Exit. Praxiswissen aus 15 Jahren als Geschäftsführer – kein Bullshit, keine Buzzwords.',
  alternates: {
    canonical: 'https://lukasebner.de/blog',
  },
  openGraph: {
    type: 'website',
    url: 'https://lukasebner.de/blog',
    title: 'Blog – Lukas Ebner',
    description: 'Artikel zu Führung, Skalierung, Systeme, KI und Exit. Praxiswissen aus 15 Jahren als Geschäftsführer – kein Bullshit, keine Buzzwords.',
    images: [{ url: defaultOgImage }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog – Lukas Ebner',
    description: 'Artikel zu Führung, Skalierung, Systeme, KI und Exit. Praxiswissen aus 15 Jahren als Geschäftsführer – kein Bullshit, keine Buzzwords.',
    images: [defaultOgImage],
  },
}

export default function BlogIndexPage() {
  const posts = listBlogPosts()
  const categories = ['all', 'operations', 'systeme', 'ki', 'exit'] as const

  return (
    <div className="min-h-screen bg-surface-light">
      <NoSnap />
      {/* Hero */}
      <div className="bg-surface-dark py-24 lg:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <h1 className="font-display text-[2.4rem] font-normal leading-[1.1] text-white md:text-[3.2rem] lg:text-[3.8rem]">
            Blog
          </h1>
          <p className="mt-4 max-w-[600px] font-body text-lg leading-relaxed text-white/60">
            Praxiswissen aus 15 Jahren als Geschäftsführer. Führung, Systeme,
            KI, Exit — kein Bullshit, keine Buzzwords.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-6 py-4">
          {categories.map((cat) => (
            <span
              key={cat}
              className="flex-shrink-0 cursor-default rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-text-secondary transition-colors hover:border-brand hover:text-brand"
              style={
                cat !== 'all'
                  ? { borderColor: CATEGORY_COLORS[cat] + '30', color: CATEGORY_COLORS[cat] }
                  : undefined
              }
            >
              {cat === 'all' ? 'Alle' : CATEGORY_LABELS[cat]}
            </span>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="mx-auto max-w-5xl px-6 py-16">
        {posts.length === 0 ? (
          <p className="font-body text-text-muted">
            Die ersten Artikel werden gerade geschrieben. Bald geht's los.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Image placeholder */}
                <div
                  className="relative h-48 w-full"
                  style={{ backgroundColor: CATEGORY_COLORS[post.category] + '15' }}
                >
                  {post.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {/* Category badge */}
                  <span
                    className="absolute left-4 top-4 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white"
                    style={{ backgroundColor: CATEGORY_COLORS[post.category] }}
                  >
                    {CATEGORY_LABELS[post.category]}
                  </span>
                  {/* Draft badge */}
                  {post.status === 'draft' && (
                    <span className="absolute right-4 top-4 rounded-full bg-yellow-400 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-black">
                      Entwurf
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display text-[1.15rem] font-normal leading-snug text-text-primary group-hover:text-brand transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 flex-1 font-body text-sm leading-relaxed text-text-secondary">
                    {post.description}
                  </p>
                  <div className="mt-4">
                    <span className="font-mono text-xs text-text-muted">
                      {new Date(post.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
