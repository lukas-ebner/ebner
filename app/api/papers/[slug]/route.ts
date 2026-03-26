import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

/**
 * GET /api/papers/[slug]
 *
 * Serves a generated strategy paper PDF from data/papers/.
 * Used as download link in emails (avoids spam filters from large attachments).
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Sanitize: only allow alphanumeric, dashes, dots
  if (!/^[\w\-\.]+\.pdf$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
  }

  const filePath = path.join(process.cwd(), 'data', 'papers', slug)

  try {
    const buffer = await readFile(filePath)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${slug}"`,
        'Cache-Control': 'private, max-age=86400',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Paper nicht gefunden' }, { status: 404 })
  }
}
