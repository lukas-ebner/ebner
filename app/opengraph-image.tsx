import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Lukas Ebner – Unternehmensberatung für KMU in Regensburg'

export default function Image() {
  return renderOgImage({
    kicker: 'Unternehmensberatung für KMU in Regensburg',
    title: 'Dein Unternehmen soll laufen. Nicht an dir hängen.',
  })
}
