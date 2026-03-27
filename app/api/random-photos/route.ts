import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

/**
 * Returns a random selection of photos from /public/images/privat/
 * Query params:
 *   count – number of photos to return (default 8, max 20)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const count = Math.min(Number(searchParams.get('count') || 8), 20)

  const dir = path.join(process.cwd(), 'public', 'images', 'privat')

  try {
    const files = fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))

    // Fisher-Yates shuffle
    const shuffled = [...files]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    const selected = shuffled.slice(0, count).map((f) => ({
      src: `/images/privat/${f}`,
      alt: '',
    }))

    return NextResponse.json(selected, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
