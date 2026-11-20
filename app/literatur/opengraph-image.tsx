import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Literaturliste von Lukas Ebner'

export default function Image() {
  return renderOgImage({ kicker: 'Literatur', title: 'Literaturliste zur Keynote „Holt den Kunden mit ins Boot!“' })
}
