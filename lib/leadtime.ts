/**
 * Leadtime CRM Integration
 *
 * Centralized module for creating leads in Leadtime from:
 * - Ebook downloads (email only)
 * - Freiheitstest / Strategy Paper (email + quiz data, sometimes company)
 * - Erstgespräch form (name + company + email + message)
 *
 * Logic:
 *   If company is known → create Organization + Person + Project (sales opportunity)
 *   If only email (freemail, no company) → create Ticket in "Laufende Anfragen"
 */

// ── Config ──────────────────────────────────────────────────────────────

const LEADTIME_BASE = 'https://leadtime.app/api/public'
const LEADTIME_TOKEN = process.env.LEADTIME_API_TOKEN || ''

// Leadtime IDs (lukasebner.de workspace)
const CONFIG = {
  // Project for anonymous tickets (no company known)
  ticketProjectId: '8b72205b-dedf-48a2-8353-d55253eb10d4',
  // Task type "Anfrage"
  ticketTypeId: '327b0253-13df-4228-9a7b-bedbf17040b3',
  // Task status "New"
  ticketStatusId: 'e30a42cf-d211-4212-a62c-7138233dabb4',
  // Custom field "Anfrager E-Mail"
  emailFieldId: '81531748-6222-4b9b-b805-adbbb85d759d',
  // Project config (copied to new sales opportunities)
  categoryId: 'c60944bb-4df2-467d-ad0b-9f5987e04601',
  projectStatusId: 'b6a95701-ba1b-47a6-a5de-4b246b2e0384', // "Vertrieb"
  userId: '268573a4-bee0-405c-bfdb-c5b6dec1970f', // Lukas
  taskTypes: [
    'e4a3c02e-13fe-455d-97fb-98f0c11a5353',
    'fe079aaf-733b-46d9-a2fd-b66b1b00d0c4',
    '327b0253-13df-4228-9a7b-bedbf17040b3',
  ],
  activities: [
    '2280594c-641e-4fe5-b9cf-f887eef79898',
    '80aaec6a-bb92-40d6-b6c3-7164f96e6bb3',
    'bd16786a-8a0a-4efe-9f97-056b3916a622',
    'f5347885-ff76-43b7-9f0f-a276035933ff',
  ],
  guestRoleId: 'KQPRXN_guest_',
}

const FREEMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.de',
  'hotmail.com', 'hotmail.de', 'outlook.com', 'outlook.de',
  'web.de', 'gmx.de', 'gmx.net', 'gmx.at', 'gmx.ch',
  't-online.de', 'icloud.com', 'me.com', 'mac.com',
  'live.com', 'live.de', 'aol.com', 'protonmail.com',
  'proton.me', 'mail.de', 'posteo.de', 'mailbox.org',
]

// ── HTTP helpers ────────────────────────────────────────────────────────

function headers() {
  return {
    Authorization: `Bearer ${LEADTIME_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

async function ltGet(path: string) {
  const res = await fetch(`${LEADTIME_BASE}${path}`, { headers: headers() })
  if (!res.ok) throw new Error(`Leadtime GET ${path}: ${res.status}`)
  return res.json()
}

async function ltPost(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${LEADTIME_BASE}${path}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Leadtime POST ${path}: ${res.status} – ${text}`)
  }
  return res.json()
}

async function ltPatch(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${LEADTIME_BASE}${path}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Leadtime PATCH ${path}: ${res.status} – ${text}`)
  }
  return res.json()
}

// ── Company enrichment via Serper ───────────────────────────────────────

interface CompanyData {
  website?: string
  street?: string
  zip?: string
  city?: string
  country?: string
}

async function enrichCompany(company: string, email: string): Promise<CompanyData> {
  const result: CompanyData = {}

  // Fallback: email domain as website
  const domain = email.split('@')[1]
  if (domain && !FREEMAIL_DOMAINS.includes(domain)) {
    result.website = `https://${domain}`
  }

  const serperKey = process.env.SERPER_API_KEY
  if (!serperKey) return result

  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `"${company}" Adresse Impressum`, gl: 'de', hl: 'de', num: 5 }),
    })
    if (!res.ok) return result
    const data = await res.json()

    if (data.knowledgeGraph) {
      const kg = data.knowledgeGraph
      if (kg.website) result.website = kg.website
      if (kg.address) {
        const match = kg.address.match(/^(.+?),\s*(\d{4,5})\s+(.+?)(?:,\s*(.+))?$/)
        if (match) {
          result.street = match[1]
          result.zip = match[2]
          result.city = match[3]
          result.country = match[4] || 'Deutschland'
        }
      }
    }
  } catch {
    // Enrichment is best-effort
  }

  return result
}

// ── Fetch all organizations (paginated) ─────────────────────────────────

async function fetchAllOrgs(): Promise<Array<{ id: string; name: string }>> {
  const all: Array<{ id: string; name: string }> = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const data = await ltGet(`/organizations?pageSize=100&page=${page}`)
    const items = data.items || data.data || data
    if (Array.isArray(items) && items.length > 0) {
      all.push(...items)
      hasMore = items.length === 100
    } else {
      hasMore = false
    }
    page++
  }
  return all
}

// ── Find or create organization tag ─────────────────────────────────────

async function ensureTag(tagName: string): Promise<string> {
  const tags = await ltGet('/tags/organization/list')
  const tagList = Array.isArray(tags) ? tags : tags.data || tags.items || []
  const existing = tagList.find((t: { name: string }) => t.name.toLowerCase() === tagName.toLowerCase())
  if (existing) return existing.id

  const created = await ltPost('/tags/organization/create', { name: tagName })
  return created.id
}

// ── Public API ──────────────────────────────────────────────────────────

export type LeadSource = 'ebook' | 'freiheitstest' | 'erstgespraech'

export interface LeadData {
  email: string
  name?: string
  company?: string
  position?: string
  source: LeadSource
  message?: string
  quizScore?: number
  quizTopPillars?: string[]
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  ebook: 'Ebook-Download',
  freiheitstest: 'Freiheitstest',
  erstgespraech: 'Erstgespräch-Anfrage',
}

/**
 * Creates a lead in Leadtime CRM.
 *
 * - With company: Organization + Person + Project (sales opportunity)
 * - Without company: Ticket in "Laufende Anfragen" project
 *
 * This function is fire-and-forget safe – all errors are caught and logged.
 */
export async function createLead(data: LeadData): Promise<void> {
  if (!LEADTIME_TOKEN) {
    console.warn('[leadtime] LEADTIME_API_TOKEN not set – skipping lead creation')
    return
  }

  try {
    const hasCompany = !!data.company?.trim()
    const isFreemail = FREEMAIL_DOMAINS.includes(data.email.split('@')[1] || '')
    const sourceLabel = SOURCE_LABELS[data.source]
    const now = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

    if (hasCompany) {
      await createFullLead(data, sourceLabel, now)
    } else if (!isFreemail) {
      // Try to use email domain as company name
      const domain = data.email.split('@')[1]
      const domainCompany = domain.replace(/\.(de|com|net|org|io|at|ch|eu)$/i, '')
      await createFullLead({ ...data, company: domainCompany }, sourceLabel, now)
    } else {
      // Only email, no company derivable → ticket
      await createTicket(data, sourceLabel, now)
    }

    console.log(`[leadtime] Lead created for ${data.email} (source: ${data.source})`)
  } catch (error) {
    console.error('[leadtime] Lead creation failed:', error)
  }
}

// ── Full lead: Organization + Person + Project ──────────────────────────

async function createFullLead(data: LeadData, sourceLabel: string, date: string) {
  const company = data.company!.trim()

  // 1. Find or create organization
  const orgs = await fetchAllOrgs()
  const companyLower = company.toLowerCase()
  const existingOrg = orgs.find(
    (o) => o.name.toLowerCase().includes(companyLower) || companyLower.includes(o.name.toLowerCase())
  )

  let orgId: string
  if (existingOrg) {
    orgId = existingOrg.id
  } else {
    const enriched = await enrichCompany(company, data.email)
    const newOrg = await ltPost('/organizations', {
      name: company,
      type: 'Prospect',
      color: '#F44900',
      website: enriched.website || '',
      addressStreet: enriched.street || '',
      addressZip: enriched.zip || '',
      addressCity: enriched.city || '',
      addressCountry: enriched.country || 'Deutschland',
    })
    orgId = newOrg.id

    // Tag
    try {
      const tagId = await ensureTag('website')
      await ltPatch(`/organizations/${orgId}`, { tagIds: [tagId] })
    } catch {
      // Tagging is best-effort
    }
  }

  // 2. Create contact/member
  try {
    let firstName = '-'
    let lastName = '-'
    if (data.name?.trim()) {
      const nameParts = data.name.trim().split(/\s+/)
      firstName = nameParts[0]
      lastName = nameParts.slice(1).join(' ') || '-'
    }

    await ltPost('/organizations/members', {
      organizationId: orgId,
      firstName,
      lastName,
      email: data.email,
      position: data.position || '',
      phone: '',
      roleId: CONFIG.guestRoleId,
      isActive: true,
      canLogin: false,
    })
  } catch (e) {
    // Member might already exist
    console.warn('[leadtime] Member creation skipped (might already exist):', e)
  }

  // 3. Create project (sales opportunity)
  const descParts = [`<p><strong>Quelle:</strong> ${sourceLabel} (${date})</p>`]
  if (data.email) descParts.push(`<p><strong>E-Mail:</strong> ${data.email}</p>`)
  if (data.name) descParts.push(`<p><strong>Name:</strong> ${data.name}</p>`)
  if (data.message) descParts.push(`<p><strong>Nachricht:</strong> ${data.message}</p>`)
  if (data.quizScore !== undefined) {
    descParts.push(`<p><strong>Freiheitsgrad:</strong> ${data.quizScore}%</p>`)
    if (data.quizTopPillars?.length) {
      descParts.push(`<p><strong>Handlungsbedarf:</strong> ${data.quizTopPillars.join(', ')}</p>`)
    }
  }

  await ltPost('/projects', {
    name: `${company} – ${sourceLabel}`,
    type: 'Support',
    valueGroup: 'DirectValue',
    categoryId: CONFIG.categoryId,
    statusId: CONFIG.projectStatusId,
    phaseId: null,
    organizationId: orgId,
    description: descParts.join('\n'),
    guestAccess: false,
    users: [CONFIG.userId],
    teams: [],
    taskTypes: CONFIG.taskTypes,
    activities: CONFIG.activities,
    customFields: {},
  })
}

// ── Ticket fallback: just a task in "Laufende Anfragen" ─────────────────

async function createTicket(data: LeadData, sourceLabel: string, date: string) {
  const descParts = [`<p><strong>Quelle:</strong> ${sourceLabel} (${date})</p>`]
  descParts.push(`<p><strong>E-Mail:</strong> ${data.email}</p>`)
  if (data.name) descParts.push(`<p><strong>Name:</strong> ${data.name}</p>`)
  if (data.message) descParts.push(`<p><strong>Nachricht:</strong> ${data.message}</p>`)
  if (data.quizScore !== undefined) {
    descParts.push(`<p><strong>Freiheitsgrad:</strong> ${data.quizScore}%</p>`)
    if (data.quizTopPillars?.length) {
      descParts.push(`<p><strong>Handlungsbedarf:</strong> ${data.quizTopPillars.join(', ')}</p>`)
    }
  }

  await ltPost('/tasks', {
    title: `${sourceLabel}: ${data.email}`,
    projectId: CONFIG.ticketProjectId,
    typeId: CONFIG.ticketTypeId,
    statusId: CONFIG.ticketStatusId,
    priority: 'Normal',
    summary: `${sourceLabel} von ${data.email}`,
    estimatedTime: 1,
    description: descParts.join('\n'),
    customFields: [{ fieldId: CONFIG.emailFieldId, value: data.email }],
  })
}
