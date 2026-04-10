import { getUtmParams } from '@/lib/utm'

export type LeadtimePathVariant = 'self_serve' | 'enterprise'

export type LeadtimeEventName =
  | 'lt_cta_impression'
  | 'lt_cta_clicked'
  | 'lt_path_selected'
  | 'lt_paywall_impression'
  | 'lt_trial_started'
  | 'lt_signup_started'
  | 'lt_signup_completed'
  | 'lt_activation_reached'
  | 'lt_demo_requested'
  | 'lt_paid_signal_detected'
  | 'lt_payment_abandoned'

const EXPERIMENT_ID = 'dual_path_v1'
const SESSION_KEY = 'lt_dual_path_session_id'

type TrackOptions = {
  pathVariant?: LeadtimePathVariant
  href?: string
}

type TrackPayload = Record<string, unknown>

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `lt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'

  try {
    const existing = sessionStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const next = createSessionId()
    sessionStorage.setItem(SESSION_KEY, next)
    return next
  } catch {
    return createSessionId()
  }
}

function normalizePath(raw: string): string {
  try {
    const url = raw.startsWith('http') ? new URL(raw) : new URL(raw, window.location.origin)
    return url.pathname.toLowerCase()
  } catch {
    return raw.toLowerCase()
  }
}

function inferPathVariant(options: TrackOptions): LeadtimePathVariant {
  if (options.pathVariant) return options.pathVariant

  const fromHref = options.href ? normalizePath(options.href) : ''
  const fromPathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : ''
  const probe = fromHref || fromPathname

  if (probe.includes('erstgespraech')) return 'enterprise'
  return 'self_serve'
}

function pushDataLayerEvent(event: LeadtimeEventName, payload: TrackPayload): void {
  if (typeof window === 'undefined') return
  const w = window as Window & { dataLayer?: TrackPayload[] }
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ event, ...payload })
}

function capturePosthogEvent(event: LeadtimeEventName, payload: TrackPayload): void {
  if (typeof window === 'undefined') return
  const w = window as Window & {
    posthog?: { capture: (name: string, properties?: TrackPayload) => void }
  }
  if (w.posthog && typeof w.posthog.capture === 'function') {
    w.posthog.capture(event, payload)
  }
}

export function isDualPathSelectionHref(href?: string): boolean {
  if (!href) return false
  const path = normalizePath(href)
  return path.includes('/erstgespraech') || path.includes('/preise')
}

export function trackLeadtimeEvent(
  event: LeadtimeEventName,
  properties: TrackPayload = {},
  options: TrackOptions = {}
): void {
  if (typeof window === 'undefined') return

  const pathVariant = inferPathVariant(options)
  const payload: TrackPayload = {
    experiment_id: EXPERIMENT_ID,
    session_id: getSessionId(),
    path_variant: pathVariant,
    page_path: window.location.pathname,
    event_ts: new Date().toISOString(),
    ...getUtmParams(),
    ...properties,
  }

  try {
    capturePosthogEvent(event, payload)
  } catch {
    // non-blocking analytics path
  }

  try {
    pushDataLayerEvent(event, payload)
  } catch {
    // non-blocking analytics path
  }
}
