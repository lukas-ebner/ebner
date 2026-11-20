import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Blog von Lukas Ebner: Führung, Prozesse, KI und Exit'

export default function Image() {
  return renderOgImage({ kicker: 'Blog', title: 'Führung, Prozesse, KI und Exit für Geschäftsführer im Mittelstand' })
}
