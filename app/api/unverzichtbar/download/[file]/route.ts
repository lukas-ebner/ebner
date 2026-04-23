import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/leadmagnet-token'
import { createReadStream, statSync } from 'fs'
import path from 'path'

/**
 * GET /api/unverzichtbar/download/[file]?token=...
 *
 * Validates the signed download token and streams the requested file
 * from the persistent Coolify volume at /app/public/files/leadmagnet/.
 *
 * Supported files: unverzichtbar.epub, unverzichtbar.pdf, unverzichtbar.m4b
 */
const ALLOWED_FILES = new Set([
  'unverzichtbar.epub',
  'unverzichtbar.pdf',
  'unverzichtbar.m4b',
])

const CONTENT_TYPES: Record<string, string> = {
  epub: 'application/epub+zip',
  pdf: 'application/pdf',
  m4b: 'audio/mp4',
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ file: string }> }
) {
  const { file } = await context.params

  if (!ALLOWED_FILES.has(file)) {
    return NextResponse.json({ error: 'Unknown file' }, { status: 404 })
  }

  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 })
  }

  const payload = verifyToken(token, 'download')
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }

  if (payload.file !== file) {
    return NextResponse.json({ error: 'Token does not match file' }, { status: 401 })
  }

  // File served from Coolify persistent volume
  const baseDir =
    process.env.LEADMAGNET_FILES_DIR || path.join(process.cwd(), 'public', 'files', 'leadmagnet')
  const filePath = path.join(baseDir, file)

  let stat
  try {
    stat = statSync(filePath)
  } catch {
    console.error(`[unverzichtbar/download] File not found: ${filePath}`)
    return NextResponse.json({ error: 'File unavailable' }, { status: 404 })
  }

  const ext = file.split('.').pop() || ''
  const contentType = CONTENT_TYPES[ext] || 'application/octet-stream'

  console.log(
    `[unverzichtbar/download] ${payload.email} → ${file} (${Math.round(stat.size / 1024 / 1024)} MB)`
  )

  // Stream file
  const stream = createReadStream(filePath)
  // @ts-expect-error — Node stream is compatible with ReadableStream in Next runtime
  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(stat.size),
      'Content-Disposition': `attachment; filename="${file}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
