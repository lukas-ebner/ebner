import { NextRequest, NextResponse } from 'next/server'
import { createLead, type LeadSource } from '@/lib/leadtime'

/**
 * POST /api/lead
 *
 * Centralized lead capture endpoint.
 * Creates organization + person + project in Leadtime,
 * or falls back to a ticket if no company can be determined.
 *
 * Body: { email, name?, company?, position?, source, message?, quizScore?, quizTopPillars?, utm? }
 *   utm: { utm_source?, utm_medium?, utm_campaign?, utm_content?, utm_term?, gclid? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name, company, position, source, message, quizScore, quizTopPillars, utm } = body

    if (!email || !source) {
      return NextResponse.json({ error: 'email and source are required' }, { status: 400 })
    }

    const validSources: (LeadSource | string)[] = [
      // Legacy values (still accepted, mapped internally)
      'ebook', 'freiheitstest', 'erstgespraech', 'unverzichtbar',
      // New canonical values
      'website-erstgespraech', 'website-ebook', 'website-freiheitstest',
      'website-unverzichtbar', 'website-chatbot',
      'linkedin-dm', 'linkedin-comment', 'botdog-accepted', 'manual',
    ]
    if (!validSources.includes(source)) {
      return NextResponse.json({ error: 'Invalid source' }, { status: 400 })
    }

    // Fire-and-forget: don't block the response on CRM creation
    createLead({
      email, name, company, position, source, message, quizScore, quizTopPillars,
      utm: utm ? {
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        utm_content: utm.utm_content,
        utm_term: utm.utm_term,
        gclid: utm.gclid,
        referrer: utm.referrer,
        landingPage: utm.landingPage,
      } : undefined,
    }).catch((err) =>
      console.error('[lead] Background lead creation failed:', err)
    )

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('[lead] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
