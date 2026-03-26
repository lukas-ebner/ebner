import { NextRequest, NextResponse } from 'next/server'
import { createLead } from '@/lib/leadtime'

/**
 * POST /api/contact
 *
 * Handles Erstgespräch form submissions:
 * 1. Sends notification email via Resend
 * 2. Creates lead in Leadtime CRM
 *
 * Body: { name, email, company, message?, actionCode? }
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, company, message, actionCode } = body

    if (!name || !email || !company) {
      return NextResponse.json(
        { error: 'Name, E-Mail und Unternehmen sind erforderlich.' },
        { status: 400 }
      )
    }

    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'Bitte gib eine gültige E-Mail-Adresse ein.' },
        { status: 400 }
      )
    }

    // 1. Send notification email via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const emailPayload = {
        from: 'Lukas Ebner Website <lukas@lukasebner.de>',
        to: ['lukas@lukasebner.de'],
        subject: `Erstgespräch-Anfrage von ${name} (${company})`,
        html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; color: #1a1a1a;">
          <h2 style="color: #F44900;">Neue Erstgespräch-Anfrage</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>E-Mail:</strong> ${email}</p>
          <p><strong>Unternehmen:</strong> ${company}</p>
          ${message ? `<p><strong>Nachricht:</strong> ${message}</p>` : ''}
          ${actionCode ? `<p><strong>Aktionscode:</strong> ${actionCode}</p>` : ''}
        </div>`,
      }

      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      }).catch((err) => console.error('[contact] Email notification failed:', err))
    }

    // 2. Redeem action code if provided
    if (actionCode?.trim()) {
      // This is handled client-side already, but double-check server-side
    }

    // 3. Create lead in Leadtime CRM
    createLead({
      email,
      name,
      company,
      source: 'erstgespraech',
      message: message || undefined,
    }).catch((err) => console.error('[contact] Lead creation failed:', err))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[contact] Error:', error)
    return NextResponse.json(
      { error: 'Beim Senden ist ein Fehler aufgetreten.' },
      { status: 500 }
    )
  }
}
