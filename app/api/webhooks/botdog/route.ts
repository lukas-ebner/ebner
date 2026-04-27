import { NextRequest, NextResponse } from 'next/server'
import { createLead, type LeadData } from '@/lib/leadtime'

/**
 * POST /api/webhooks/botdog
 *
 * Receiver for Botdog webhook events. Configure in Botdog UI under
 * https://app.botdog.co/settings/integrations/webhooks
 *
 *   URL:    https://lukasebner.de/api/webhooks/botdog?secret=<BOTDOG_WEBHOOK_SECRET>
 *   Events: invitationAccepted (recommended), replyReceived (optional)
 *
 * Auth: shared-secret via `?secret=` query param OR `x-webhook-secret` header.
 * Set BOTDOG_WEBHOOK_SECRET in Coolify env (any random 32+ char string).
 *
 * Behavior:
 *   - invitationAccepted -> creates a SALES ticket with source=botdog-accepted
 *   - replyReceived      -> creates a SALES ticket with source=linkedin-dm
 *                            (the lead engaged actively, treat as warm DM)
 *   - other events       -> 200 OK with status=ignored (no ticket)
 *
 * LinkedIn connections don't expose an email. We build a placeholder
 * "<linkedin-slug>@linkedin.invalid" so downstream code (which requires
 * LeadData.email) keeps working. The real LinkedIn URL goes into the
 * linkedinUrl field of the description.
 */
export async function POST(req: NextRequest) {
  // ── 1. Auth ──────────────────────────────────────────────────────────
  const expected = process.env.BOTDOG_WEBHOOK_SECRET
  if (!expected) {
    console.error('[botdog-webhook] BOTDOG_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'webhook not configured' }, { status: 503 })
  }

  const url = new URL(req.url)
  const provided = url.searchParams.get('secret') || req.headers.get('x-webhook-secret')
  if (provided !== expected) {
    console.warn('[botdog-webhook] auth failed')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // ── 2. Parse payload ──────────────────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const event = (body.event || body.type || body.eventType) as string | undefined
  if (!event) {
    return NextResponse.json({ error: 'event field missing' }, { status: 400 })
  }

  // ── 3. Filter events ──────────────────────────────────────────────────
  // We only create tickets for these two events.
  let source: 'botdog-accepted' | 'linkedin-dm' | null = null
  if (event === 'invitationAccepted') source = 'botdog-accepted'
  else if (event === 'replyReceived') source = 'linkedin-dm'

  if (!source) {
    console.log(`[botdog-webhook] ignored event: ${event}`)
    return NextResponse.json({ status: 'ignored', event })
  }

  // ── 4. Extract lead fields (defensively) ─────────────────────────────
  // Botdog may nest the lead under .lead, .data, .profile, or flat.
  const lead = (body.lead || body.data || body.profile || body) as Record<string, unknown>
  const get = (...keys: string[]): string | undefined => {
    for (const k of keys) {
      const v = lead[k] ?? body[k]
      if (typeof v === 'string' && v.trim()) return v.trim()
    }
    return undefined
  }

  const name = get('name', 'fullName', 'leadName')
  const linkedinUrl = get('linkedinUrl', 'linkedin_url', 'profileUrl', 'profile_url', 'url')
  const company = get('company', 'companyName', 'organization')
  const position = get('title', 'position', 'jobTitle', 'role')
  const replyText = get('replyText', 'message', 'replyMessage', 'reply')

  // Synthesize email from LinkedIn slug. Falls back to a hash of name+company.
  const slug = linkedinUrl?.match(/linkedin\.com\/in\/([^/?#]+)/i)?.[1]
  const emailLocal = slug
    || (name ? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : null)
    || `unknown-${Date.now()}`
  const email = `${emailLocal}@linkedin.invalid`

  const messageParts: string[] = []
  messageParts.push(`Botdog-Event: ${event}`)
  if (event === 'invitationAccepted') {
    messageParts.push(`Hat die Vernetzungsanfrage angenommen.`)
  } else if (event === 'replyReceived') {
    messageParts.push(`Hat auf eine LinkedIn-Nachricht geantwortet.`)
    if (replyText) messageParts.push(`\nAntwort:\n${replyText}`)
  }

  const leadData: LeadData = {
    email,
    name,
    company,
    position,
    linkedinUrl,
    source,
    message: messageParts.join('\n'),
  }

  // ── 5. Fire-and-forget createLead ─────────────────────────────────────
  createLead(leadData).catch((err) =>
    console.error('[botdog-webhook] createLead failed:', err)
  )

  console.log(`[botdog-webhook] queued ticket: event=${event} email=${email} name=${name || '?'}`)

  return NextResponse.json({
    status: 'ok',
    event,
    source,
    email,
  })
}

/**
 * GET /api/webhooks/botdog
 *
 * Health check — returns 200 if BOTDOG_WEBHOOK_SECRET is configured.
 * Useful for the Botdog UI to test webhook reachability.
 */
export async function GET() {
  const configured = Boolean(process.env.BOTDOG_WEBHOOK_SECRET)
  return NextResponse.json({
    service: 'botdog-webhook',
    configured,
    accepts: ['invitationAccepted', 'replyReceived'],
  })
}
