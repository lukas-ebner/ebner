import { readFile } from 'fs/promises'
import path from 'path'
import { ImageResponse } from 'next/og'

/**
 * Eigene Open-Graph-Bilder (1200×630) je Seite, gerendert beim Build über `next/og`.
 * Genutzt von den `opengraph-image.tsx`-Dateien in app/.
 */
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

const PUBLIC_DIR = path.join(process.cwd(), 'public')
const BRAND = '#F44900'
const DARK = '#191819'

/** „Titel – Lukas Ebner“ / „Titel | Lukas Ebner“ → „Titel“ (Name steht ohnehin im Bild). */
export function ogTitle(title: string): string {
  return title
    .replace(/\s*[–|-]\s*Lukas Ebner\s*$/i, '')
    .replace(/\s+\|\s+/g, ' – ')
    .trim()
}

async function publicFileAsDataUrl(relPath: string): Promise<string | null> {
  const clean = relPath.replace(/^\/+/, '')
  const ext = path.extname(clean).toLowerCase()
  const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : null
  if (!mime) return null // next/og kann kein WebP/AVIF
  try {
    const buf = await readFile(path.join(PUBLIC_DIR, clean))
    return `data:${mime};base64,${buf.toString('base64')}`
  } catch {
    return null
  }
}

async function fonts() {
  const [regular, bold] = await Promise.all([
    readFile(path.join(PUBLIC_DIR, 'fonts/DegularDisplay-Regular.otf')),
    readFile(path.join(PUBLIC_DIR, 'fonts/DegularDisplay-Bold.otf')),
  ])
  return [
    { name: 'Degular', data: regular, weight: 400 as const, style: 'normal' as const },
    { name: 'Degular', data: bold, weight: 700 as const, style: 'normal' as const },
  ]
}

function titleSize(title: string): number {
  if (title.length > 90) return 52
  if (title.length > 60) return 60
  if (title.length > 36) return 68
  return 80
}

export interface OgOptions {
  title: string
  /** Kleine Zeile über dem Titel, z. B. Kategorie oder Seitentyp */
  kicker?: string
  /** Hintergrundbild aus /public (JPG/PNG), z. B. das Hero-Bild eines Blogartikels */
  background?: string
  /** Akzentfarbe (Balken, Kicker) */
  accent?: string
  /** Porträt von Lukas rechts zeigen (Standard: ja, wenn kein Hintergrundbild) */
  portrait?: boolean
}

export async function renderOgImage({ title, kicker, background, accent = BRAND, portrait }: OgOptions) {
  const [bg, face, fontData] = await Promise.all([
    background ? publicFileAsDataUrl(background) : Promise.resolve(null),
    (portrait ?? !background) ? publicFileAsDataUrl('/images/lukas.png') : Promise.resolve(null),
    fonts(),
  ])
  const text = ogTitle(title)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: DARK,
          fontFamily: 'Degular',
          color: '#FFFFFF',
        }}
      >
        {bg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bg}
            alt=""
            width={1200}
            height={630}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        {bg && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              backgroundImage:
                'linear-gradient(0deg, rgba(25,24,25,0.9) 0%, rgba(25,24,25,0) 45%), linear-gradient(90deg, rgba(25,24,25,0.94) 0%, rgba(25,24,25,0.8) 55%, rgba(25,24,25,0.35) 100%)',
            }}
          />
        )}
        {face && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={face}
            alt=""
            width={390}
            height={502}
            style={{ position: 'absolute', right: 40, bottom: 0, width: 390, height: 502, objectFit: 'cover' }}
          />
        )}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 16, backgroundColor: accent, display: 'flex' }} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 72px 56px 88px',
            width: face ? 790 : 1100,
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {kicker && (
              <div style={{ display: 'flex', fontSize: 26, letterSpacing: 3, textTransform: 'uppercase', color: BRAND }}>
                {kicker}
              </div>
            )}
            <div style={{ display: 'flex', marginTop: 24, fontSize: titleSize(text), fontWeight: 700, lineHeight: 1.08 }}>
              {text}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 28, color: 'rgba(255,255,255,0.75)' }}>
            <div style={{ display: 'flex', color: '#FFFFFF', fontWeight: 700 }}>Lukas Ebner</div>
            <div style={{ display: 'flex' }}>Wachstumscoach GmbH · Regensburg · lukasebner.de</div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fontData },
  )
}
