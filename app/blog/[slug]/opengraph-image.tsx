import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
import { CATEGORY_COLORS, CATEGORY_LABELS, listBlogSlugs, loadBlogPost } from '@/lib/blog'

export const alt = 'Blogartikel von Lukas Ebner'

export function generateStaticParams() {
  return listBlogSlugs().map((slug) => ({ slug }))
}

/** Blog: Hero-Bild des Artikels als Hintergrund, Titel darüber. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { meta } = loadBlogPost(slug)
  return renderOgImage({
    title: meta.title,
    kicker: `Blog · ${CATEGORY_LABELS[meta.category] ?? meta.category}`,
    background: meta.image,
    accent: CATEGORY_COLORS[meta.category] === '#191819' ? undefined : CATEGORY_COLORS[meta.category],
  })
}
