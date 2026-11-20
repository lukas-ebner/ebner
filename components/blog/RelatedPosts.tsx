import Image from 'next/image'
import Link from 'next/link'
import { CATEGORY_LABELS } from '@/lib/blog'
import type { BlogPostMeta } from '@/lib/types'

/** „Verwandte Artikel“: stärkt die interne Verlinkung zwischen Blogartikeln derselben Kategorie. */
export function RelatedPosts({ posts }: { posts: BlogPostMeta[] }) {
  if (posts.length === 0) return null
  return (
    <section aria-labelledby="verwandte-artikel" className="mt-16">
      <h2 id="verwandte-artikel" className="font-display text-[1.6rem] text-text-primary">
        Verwandte Artikel
      </h2>
      <ul className="mt-6 grid gap-6 sm:grid-cols-3">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="group block h-full overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {p.image && (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 240px, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-4">
                <p className="font-mono text-[0.7rem] uppercase tracking-widest text-text-muted">
                  {CATEGORY_LABELS[p.category] ?? p.category}
                </p>
                <p className="mt-2 font-display text-base leading-snug text-text-primary group-hover:text-brand">
                  {p.title}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
