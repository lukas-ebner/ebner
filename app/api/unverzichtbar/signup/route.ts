import { NextRequest, NextResponse } from 'next/server'
import { signToken, SITE_URL } from '@/lib/leadmagnet-token'

/**
 * POST /api/unverzichtbar/signup
 *
 * Step 1 of Double-Opt-In flow for the (Un)verzichtbar leadmagnet.
 * Sends a confirmation email with a signed token link.
 * No CRM creation yet — that happens after confirm.
 *
 * Body: { email: string, name?: string, company?: string, utm?: {...} }
 *   utm: { utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid } — alle optional
 */
export async function POST(req: NextRequest) {
  try {
    const { email, name, company, utm } = (await req.json()) as {
      email?: string
      name?: string
      company?: string
      utm?: {
        utm_source?: string
        utm_medium?: string
        utm_campaign?: string
        utm_content?: string
        utm_term?: string
        gclid?: string
      }
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'Bitte gib eine gültige E-Mail-Adresse ein.' },
        { status: 400 }
      )
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      console.error('[unverzichtbar/signup] RESEND_API_KEY not set')
      return NextResponse.json({ error: 'E-Mail-Versand nicht verfügbar.' }, { status: 500 })
    }

    // Build confirm token (48h validity) — carry UTM/gclid through the DOI flow
    const token = signToken(email, 'unverzichtbar', 'confirm', 60 * 60 * 48, {
      name: name || undefined,
      company: company || undefined,
      utm_source: utm?.utm_source,
      utm_medium: utm?.utm_medium,
      utm_campaign: utm?.utm_campaign,
      utm_content: utm?.utm_content,
      utm_term: utm?.utm_term,
      gclid: utm?.gclid,
    })

    const confirmUrl = `${SITE_URL}/api/unverzichtbar/confirm?token=${encodeURIComponent(token)}`

    const firstName = name?.trim().split(/\s+/)[0] || ''
    const greeting = firstName ? `Hi ${firstName},` : 'Hi,'

    const payload = {
      from: 'Lukas Ebner <lukas@lukasebner.de>',
      to: [email],
      subject: 'Kurz bestätigen – dann bekommst du das Buch',
      html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">

  <p style="font-size: 16px; line-height: 1.6;">${greeting}</p>

  <p style="font-size: 16px; line-height: 1.6;">
    du hast <strong>„(Un)verzichtbar"</strong> angefordert &ndash; den Unternehmer-Roman
    über 90 Tage im Mittelstand.
  </p>

  <p style="font-size: 16px; line-height: 1.6;">
    Damit ich sichergehen kann, dass wirklich du das warst, klick bitte einmal
    auf den Bestätigungs-Button. Danach bekommst du sofort die drei Formate:
    eBook, PDF und Audiobook.
  </p>

  <p style="margin: 28px 0;">
    <a href="${confirmUrl}" style="display: inline-block; background: #F44900; color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 16px; font-weight: 600;">Ja, ich will das Buch</a>
  </p>

  <p style="font-size: 14px; line-height: 1.6; color: #6a6a6a;">
    Der Bestätigungslink ist 48 Stunden gültig. Falls du die Anfrage nicht gestellt hast,
    ignorier diese Mail einfach &ndash; es wird nichts gespeichert.
  </p>

  <p style="font-size: 16px; line-height: 1.6; margin-top: 32px;">Lukas</p>

  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E8E5DE;">
    <p style="font-size: 13px; color: #7a7a7a; margin: 0; line-height: 1.6;">Lukas Ebner<br>Wachstumscoach GmbH | HRB 19991, Amtsgericht Regensburg<br>Yorckstr. 22, 93049 Regensburg | Fon: +49 941 463 909 80<br><a href="https://lukasebner.de" style="color: #7a7a7a;">lukasebner.de</a></p>
  </div>

</div>`,
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errBody = await res.text()
      console.error('[unverzichtbar/signup] Resend error:', errBody)
      return NextResponse.json(
        { error: 'E-Mail konnte nicht gesendet werden.' },
        { status: 502 }
      )
    }

    const result = await res.json()
    console.log(`[unverzichtbar/signup] Confirm email sent to ${email} (Resend ID: ${result.id})`)

    return NextResponse.json({
      status: 'confirm_sent',
      message: 'Check deine Mails. Klick auf den Bestätigungslink und du bekommst sofort das Buch.',
    })
  } catch (error) {
    console.error('[unverzichtbar/signup] Error:', error)
    return NextResponse.json(
      { error: 'Interner Fehler. Bitte versuche es später noch einmal.' },
      { status: 500 }
    )
  }
}
