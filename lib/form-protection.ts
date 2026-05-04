import { NextRequest } from 'next/server'

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5
const submissionsByIp = new Map<string, number[]>()

export interface FormProtectionOptions {
  honeypot?: unknown
  formStartedAt?: unknown
  minElapsedMs?: number
  maxElapsedMs?: number
  rateLimitMax?: number
  rateLimitWindowMs?: number
}

export function validateFormProtection(req: NextRequest, options: FormProtectionOptions) {
  const {
    honeypot,
    formStartedAt,
    minElapsedMs = 2500,
    maxElapsedMs = 2 * 60 * 60 * 1000,
    rateLimitMax = RATE_LIMIT_MAX,
    rateLimitWindowMs = RATE_LIMIT_WINDOW_MS,
  } = options

  if (typeof honeypot === 'string' && honeypot.trim()) {
    return { ok: false as const, status: 200, message: 'ok' }
  }

  const startedAt = Number(formStartedAt)
  const elapsedMs = Number.isFinite(startedAt) ? Date.now() - startedAt : NaN
  if (!Number.isFinite(elapsedMs) || elapsedMs < minElapsedMs || elapsedMs > maxElapsedMs) {
    return {
      ok: false as const,
      status: 400,
      message: 'Anfrage konnte nicht verifiziert werden. Bitte Formular erneut absenden.',
    }
  }

  const ip = getClientIp(req)
  const now = Date.now()
  const recent = (submissionsByIp.get(ip) || []).filter((ts) => now - ts < rateLimitWindowMs)
  if (recent.length >= rateLimitMax) {
    submissionsByIp.set(ip, recent)
    return {
      ok: false as const,
      status: 429,
      message: 'Zu viele Anfragen in kurzer Zeit. Bitte versuche es in ein paar Minuten erneut.',
    }
  }

  recent.push(now)
  submissionsByIp.set(ip, recent)
  return { ok: true as const }
}

export function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

export function isSuspiciousText(value: string) {
  return /https?:\/\/|www\.|<[^>]+>/.test(value)
}

export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
