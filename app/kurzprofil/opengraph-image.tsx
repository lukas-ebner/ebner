import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Kurzprofil Lukas Ebner'

export default function Image() {
  return renderOgImage({ kicker: 'Kurzprofil', title: 'Lebenslauf, Gründungen und Qualifikationen' })
}
