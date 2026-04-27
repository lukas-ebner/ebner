/**
 * Leadtime CRM — centralized sales pipeline.
 *
 * Every inbound lead (website form, lead magnet, LinkedIn DM, manual entry)
 * becomes ONE ticket in the SALES project (EBNER workspace, SALES-22).
 *
 * No organization, no person, no per-lead project. All contact info lives
 * inside the ticket description. When a lead becomes substantive (booked
 * meeting, signed proposal), the org/person gets created manually.
 *
 * Workspace: EBNER · Project: SALES (414c2c89-…) · Status: Neu (0d79b3dc-…)
 * Differentiation: source-tag (src:website-ebook, src:linkedin-dm, …)
 */

const LEADTIME_BASE = 'https://leadtime.app/api/public'

function getToken(): string {
  return process.env.LEADTIME_EBNER_PAT || process.env.LEADTIME_API_TOKEN || ''
}

// ── EBNER workspace UUIDs ───────────────────────────────────────────────

const SALES = {
  projectId: '414c2c89-29a4-4a3c-b371-114da2c25dd5',     // SALES-22
  typeId: '4d5a972a-8ec6-4090-a11e-e998f0047530',        // Management
  statusNeu: '0d79b3dc-c71f-470c-8ea6-ac86bbfcd163',     // Neu
  lukasUserId: '8dcc2862-ed49-4830-8fe6-c1404e372921',
} as const

// Source tag UUIDs (created 2026-04-27 via API)
const SOURCE_TAGS: Record<LeadSource, string> = {
  'website-erstgespraech': '2002533c-c2b5-43b8-bbdd-8e5383366d37',
  'website-ebook':         '70ea3b5a-ac0a-46e8-b7c0-126adf58fd8e',
  'website-freiheitstest': '8b5a0c18-0a4b-424c-80a1-4a66d4b25456',
  'website-unverzichtbar': '16848b43-b6f5-4923-ae22-5bba127b233c',
  'website-chatbot':       'a5adc642-477d-4b67-8f18-628dcaf30512',
  'linkedin-dm':           '18325108-0bf7-4cba-a377-835dbe3c1751',
  'linkedin-comment':      '89f0829f-4176-41bc-81f5-1f584076e665',
  'botdog-accepted':       '7c3a49d3-1f1b-40b7-b5e9-61bf92b81484',
  'manual':                '3d2b09bc-7aef-425e-b105-e69f2ed74f66',
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  'website-erstgespraech': 'Erstgespräch-Anfrage (Website)',
  'website-ebook':         'Ebook-Download (Cost of Chaos)',
  'website-freiheitstest': 'Freiheitstest-Quiz',
  'website-unverzichtbar': '(Un)verzichtbar Leadmagnet',
  'website-chatbot':       'KI-Readiness-Chatbot',
  'linkedin-dm':           'LinkedIn DM',
  'linkedin-comment':      'LinkedIn Kommentar',
  'botdog-accepted':       'Botdog – Connection accepted',
  'manual':                'Manuell eingetragen',
}

// Backward-compat: old LeadSource strings used by existing callers
const LEGACY_SOURCE_MAP: Record<string, LeadSource> = {
  'ebook':         'website-ebook',
  'freiheitstest': 'website-freiheitstest',
  'erstgespraech': 'website-erstgespraech',
  'unverzichtbar': 'website-unverzichtbar',
}

// ── Public types ────────────────────────────────────────────────────────

export type LeadSource =
  | 'website-erstgespraech'
  | 'website-ebook'
  | 'website-freiheitstest'
  | 'website-unverzichtbar'
  | 'website-chatbot'
  | 'linkedin-dm'
  | 'linkedin-comment'
  | 'botdog-accepted'
  | 'manual'

export interface LeadData {
  email: string
  source: LeadSource | string  // string accepted for legacy values
  // Identity
  name?: string
  firstName?: string
  lastName?: string
  company?: string
  position?: string
  phone?: string
  linkedinUrl?: string
  website?: string
  // Lead content
  message?: string
  // Quiz / scoring
  quizScore?: number
  quizTopPillars?: string[]
  // Attribution
  utm?: {
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    utm_term?: string
    utm_content?: string
    gclid?: string
    referrer?: string
    landingPage?: string
  }
  // Free-form extras (rendered as additional rows)
  extras?: Record<string, string | number | undefined>
}

// ── HTTP helpers ────────────────────────────────────────────────────────

async function ltPost(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(`${LEADTIME_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Leadtime POST ${path}: ${res.status} – ${text}`)
  }
  return res.json()
}

// ── Builders ────────────────────────────────────────────────────────────

function normalizeSource(src: LeadSource | string): LeadSource {
  if (src in SOURCE_TAGS) return src as LeadSource
  if (src in LEGACY_SOURCE_MAP) return LEGACY_SOURCE_MAP[src]
  return 'manual'
}

function escapeHtml(s: string | undefined | null): string {
  if (!s) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildTitle(data: LeadData, source: LeadSource): string {
  const sourceTag = source.replace(/^website-/, '').replace(/^linkedin-/, 'LI-').replace(/^botdog-/, 'BD-')
  const name = (data.name || [data.firstName, data.lastName].filter(Boolean).join(' ')).trim()
  const company = data.company?.trim()

  if (name && company) return `${name}, ${company} — ${sourceTag}`
  if (name)            return `${name} — ${sourceTag}`
  if (company)         return `${company} — ${sourceTag}`
  return `${data.email} — ${sourceTag}`
}

function buildDescription(data: LeadData, source: LeadSource): string {
  const label = SOURCE_LABELS[source]
  const date = new Date().toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const lines: string[] = []
  lines.push(`<p>🟢 <strong>${escapeHtml(label)}</strong> · ${escapeHtml(date)}</p>`)

  // Contact block
  const contact: string[] = []
  const fullName = data.name || [data.firstName, data.lastName].filter(Boolean).join(' ')
  if (fullName) contact.push(`<li><strong>Name:</strong> ${escapeHtml(fullName)}</li>`)
  contact.push(`<li><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></li>`)
  if (data.phone)       contact.push(`<li><strong>Telefon:</strong> ${escapeHtml(data.phone)}</li>`)
  if (data.position)    contact.push(`<li><strong>Position:</strong> ${escapeHtml(data.position)}</li>`)
  if (data.company)     contact.push(`<li><strong>Firma:</strong> ${escapeHtml(data.company)}</li>`)
  if (data.website)     contact.push(`<li><strong>Website:</strong> <a href="${escapeHtml(data.website)}" target="_blank">${escapeHtml(data.website)}</a></li>`)
  if (data.linkedinUrl) contact.push(`<li><strong>LinkedIn:</strong> <a href="${escapeHtml(data.linkedinUrl)}" target="_blank">${escapeHtml(data.linkedinUrl)}</a></li>`)
  if (contact.length) {
    lines.push('<h3>Kontakt</h3>')
    lines.push(`<ul>${contact.join('')}</ul>`)
  }

  // Message
  if (data.message?.trim()) {
    lines.push('<h3>Nachricht</h3>')
    lines.push(`<blockquote>${escapeHtml(data.message).replace(/\n/g, '<br>')}</blockquote>`)
  }

  // Quiz
  if (typeof data.quizScore === 'number') {
    lines.push('<h3>Freiheitstest</h3>')
    const quiz: string[] = []
    quiz.push(`<li><strong>Score:</strong> ${data.quizScore}%</li>`)
    if (data.quizTopPillars?.length) {
      quiz.push(`<li><strong>Top-Handlungsbedarf:</strong> ${escapeHtml(data.quizTopPillars.join(', '))}</li>`)
    }
    lines.push(`<ul>${quiz.join('')}</ul>`)
  }

  // Attribution / UTM
  const utm = data.utm
  if (utm && Object.values(utm).some(Boolean)) {
    const utmLines: string[] = []
    if (utm.utm_source)   utmLines.push(`<li><strong>Source:</strong> ${escapeHtml(utm.utm_source)}</li>`)
    if (utm.utm_medium)   utmLines.push(`<li><strong>Medium:</strong> ${escapeHtml(utm.utm_medium)}</li>`)
    if (utm.utm_campaign) utmLines.push(`<li><strong>Campaign:</strong> ${escapeHtml(utm.utm_campaign)}</li>`)
    if (utm.utm_term)     utmLines.push(`<li><strong>Term:</strong> ${escapeHtml(utm.utm_term)}</li>`)
    if (utm.utm_content)  utmLines.push(`<li><strong>Content:</strong> ${escapeHtml(utm.utm_content)}</li>`)
    if (utm.gclid)        utmLines.push(`<li><strong>gclid:</strong> ${escapeHtml(utm.gclid)}</li>`)
    if (utm.referrer)     utmLines.push(`<li><strong>Referrer:</strong> ${escapeHtml(utm.referrer)}</li>`)
    if (utm.landingPage)  utmLines.push(`<li><strong>Landing Page:</strong> ${escapeHtml(utm.landingPage)}</li>`)
    if (utmLines.length) {
      lines.push('<h3>Tracking</h3>')
      lines.push(`<ul>${utmLines.join('')}</ul>`)
    }
  }

  // Extras
  if (data.extras && Object.keys(data.extras).length) {
    lines.push('<h3>Extras</h3>')
    const extraLines = Object.entries(data.extras)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `<li><strong>${escapeHtml(k)}:</strong> ${escapeHtml(String(v))}</li>`)
    lines.push(`<ul>${extraLines.join('')}</ul>`)
  }

  return lines.join('\n')
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Creates a lead-ticket in the centralized SALES project.
 * Fire-and-forget safe — errors are caught and logged, never thrown to caller.
 */
export async function createLead(data: LeadData): Promise<void> {
  const token = getToken()
  if (!token) {
    console.warn('[leadtime] LEADTIME_EBNER_PAT not set – skipping lead creation')
    return
  }

  try {
    const source = normalizeSource(data.source)
    const priority = source === 'website-erstgespraech' ? 'High' : 'Normal'

    const payload = {
      title: buildTitle(data, source),
      projectId: SALES.projectId,
      typeId: SALES.typeId,
      statusId: SALES.statusNeu,
      priority,
      assignedToId: SALES.lukasUserId,
      summary: SOURCE_LABELS[source],
      estimatedTime: 30,
      description: buildDescription(data, source),
      tags: [SOURCE_TAGS[source]],
    }

    const result = await ltPost('/tasks', payload)
    const sn = (result as { shortNumber?: number }).shortNumber
    console.log(`[leadtime] SALES ticket created: SALES-${sn} · ${data.email} · ${source}`)
  } catch (err) {
    console.error('[leadtime] Lead creation failed:', err)
    // Do not re-throw — leads must never break the user-facing form response
  }
}
