import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
import { listThemenSlugs, loadThemenPage } from '@/lib/themen'

export const alt = 'Lukas Ebner – Themen'

export function generateStaticParams() {
  return listThemenSlugs().map((slug) => ({ slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const meta = loadThemenPage(slug).meta as { title: string; kicker?: string }
  return renderOgImage({ title: meta.title, kicker: meta.kicker ?? 'Themen' })
}
