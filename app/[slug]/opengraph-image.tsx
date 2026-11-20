import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
import { listPageSlugs, loadPage } from '@/lib/page-builder'

export const alt = 'Lukas Ebner – Wachstumscoach GmbH'

export function generateStaticParams() {
  return listPageSlugs()
    .filter((slug) => slug !== 'homepage')
    .map((slug) => ({ slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let title = 'Lukas Ebner'
  let kicker: string | undefined
  try {
    const meta = loadPage(slug).meta as { title: string; kicker?: string }
    title = meta.title
    kicker = meta.kicker
  } catch {
    // unbekannte Seite: neutrales Bild
  }
  return renderOgImage({ title, kicker: kicker ?? 'Wachstumscoach GmbH' })
}
