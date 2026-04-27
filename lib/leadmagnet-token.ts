/**
 * Leadmagnet Confirm-Token (HMAC-signed, stateless)
 *
 * Used for Double-Opt-In flow of the (Un)verzichtbar landing page.
 * Pattern: `base64url(payload).base64url(hmac_sha256(payload, secret))`
 *
 * Payload: { email, source, exp, kind }
 *
 * - `kind = "confirm"` — token for Double-Opt-In confirmation (48h valid)
 * - `kind = "download"` — token for signed download URLs (7d valid)
 */
import crypto from 'crypto'

/**
 * Public-facing canonical site URL.
 *
 * Hardcoded to lukasebner.de because `req.url` / `req.headers.host` may
 * contain the internal Docker container hostname when Next.js runs behind
 * Coolify's reverse proxy (e.g. `6bf48e7445ff:3000`). Using the hostname
 * from the request would break:
 *   - confirm-mail links (user cannot open internal hostname from their inbox)
 *   - download-mail links (same reason)
 *   - Double-Opt-In redirect to /unverzichtbar/danke
 *
 * Override via env var `NEXT_PUBLIC_SITE_URL` if needed for staging.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://lukasebner.de'

const SECRET = process.env.LEADMAGNET_SECRET || process.env.NEXTAUTH_SECRET || ''

export type TokenKind = 'confirm' | 'download'

interface TokenPayload {
  email: string
  source: string
  exp: number
  kind: TokenKind
  file?: string // only for download tokens
  name?: string // optional, only for confirm tokens
  company?: string // optional, only for confirm tokens
  // Attribution carried through DOI flow
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  gclid?: string
}

function base64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(input: string): Buffer {
  const pad = input.length % 4
  const padded = pad ? input + '='.repeat(4 - pad) : input
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

export function signToken(
  email: string,
  source: string,
  kind: TokenKind,
  ttlSeconds: number,
  extra?: {
    file?: string
    name?: string
    company?: string
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    utm_content?: string
    utm_term?: string
    gclid?: string
  }
): string {
  if (!SECRET) throw new Error('LEADMAGNET_SECRET not set')

  const payload: TokenPayload = {
    email,
    source,
    kind,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    ...(extra?.file ? { file: extra.file } : {}),
    ...(extra?.name ? { name: extra.name } : {}),
    ...(extra?.company ? { company: extra.company } : {}),
    ...(extra?.utm_source ? { utm_source: extra.utm_source } : {}),
    ...(extra?.utm_medium ? { utm_medium: extra.utm_medium } : {}),
    ...(extra?.utm_campaign ? { utm_campaign: extra.utm_campaign } : {}),
    ...(extra?.utm_content ? { utm_content: extra.utm_content } : {}),
    ...(extra?.utm_term ? { utm_term: extra.utm_term } : {}),
    ...(extra?.gclid ? { gclid: extra.gclid } : {}),
  }

  const body = base64url(JSON.stringify(payload))
  const sig = base64url(crypto.createHmac('sha256', SECRET).update(body).digest())

  return `${body}.${sig}`
}

export function verifyToken(token: string, expectedKind: TokenKind): TokenPayload | null {
  if (!SECRET) return null
  if (!token || !token.includes('.')) return null

  const [body, sig] = token.split('.')
  if (!body || !sig) return null

  const expectedSig = base64url(crypto.createHmac('sha256', SECRET).update(body).digest())

  // Constant-time comparison
  if (sig.length !== expectedSig.length) return null
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null

  let payload: TokenPayload
  try {
    payload = JSON.parse(base64urlDecode(body).toString('utf-8'))
  } catch {
    return null
  }

  if (payload.kind !== expectedKind) return null
  if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null
  if (!payload.email || !payload.email.includes('@')) return null

  return payload
}
