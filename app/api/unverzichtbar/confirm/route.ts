import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, signToken, SITE_URL } from '@/lib/leadmagnet-token'
import { createLead } from '@/lib/leadtime'

/**
 * GET /api/unverzichtbar/confirm?token=...
 *
 * Step 2 of Double-Opt-In flow.
 * Verifies token, triggers CRM lead creation, sends download email,
 * and redirects the user to /unverzichtbar/danke.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(`${SITE_URL}/unverzichtbar?error=missing_token`)
  }

  const payload = verifyToken(token, 'confirm')
  if (!payload) {
    return NextResponse.redirect(`${SITE_URL}/unverzichtbar?error=invalid_token`)
  }

  const { email, name, company } = payload

  // 1. Fire-and-forget CRM lead creation (Organization + Project, or ticket fallback)
  createLead({
    email,
    name,
    company,
    source: 'unverzichtbar',
  }).catch((err) =>
    console.error('[unverzichtbar/confirm] CRM lead creation failed:', err)
  )

  // 2. Build signed download tokens (7d validity each)
  const files = ['unverzichtbar.epub', 'unverzichtbar.pdf', 'unverzichtbar.m4b']
  const downloadLinks = files.reduce<Record<string, string>>((acc, file) => {
    const dlToken = signToken(email, 'unverzichtbar', 'download', 60 * 60 * 24 * 7, { file })
    acc[file] = `${SITE_URL}/api/unverzichtbar/download/${file}?token=${encodeURIComponent(dlToken)}`
    return acc
  }, {})

  // 3. Send download email via Resend
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const firstName = name?.trim().split(/\s+/)[0] || ''
    const greeting = firstName ? `Hi ${firstName},` : 'Hi,'

    const mailPayload = {
      from: 'Lukas Ebner <lukas@lukasebner.de>',
      to: [email],
      subject: 'Hier ist dein Buch – eBook, PDF, Audiobook',
      html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">

  <p style="font-size: 16px; line-height: 1.6;">${greeting}</p>

  <p style="font-size: 16px; line-height: 1.6;">
    bestätigt. Hier sind deine drei Formate von <strong>„(Un)verzichtbar"</strong>:
  </p>

  <div style="margin: 28px 0; background: #F5F5F0; padding: 24px; border-left: 4px solid #F44900;">

    <p style="margin: 0 0 16px 0; font-size: 15px; color: #333;"><strong>eBook · .epub</strong> &ndash; für Tolino, Kindle, Apple Books</p>
    <p style="margin: 0 0 20px 0;">
      <a href="${downloadLinks['unverzichtbar.epub']}" style="display: inline-block; background: #F44900; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 14px; font-weight: 600;">eBook herunterladen</a>
    </p>

    <p style="margin: 0 0 16px 0; font-size: 15px; color: #333;"><strong>PDF</strong> &ndash; zum Lesen am Bildschirm oder Drucken</p>
    <p style="margin: 0 0 20px 0;">
      <a href="${downloadLinks['unverzichtbar.pdf']}" style="display: inline-block; background: #F44900; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 14px; font-weight: 600;">PDF herunterladen</a>
    </p>

    <p style="margin: 0 0 16px 0; font-size: 15px; color: #333;"><strong>Audiobook · .m4b</strong> &ndash; für unterwegs, ca. 4h 25min</p>
    <p style="margin: 0;">
      <a href="${downloadLinks['unverzichtbar.m4b']}" style="display: inline-block; background: #F44900; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 14px; font-weight: 600;">Audiobook herunterladen</a>
    </p>

  </div>

  <p style="font-size: 15px; line-height: 1.6; color: #555;">
    Die Download-Links sind 7 Tage gültig. Speicher dir die Dateien direkt lokal,
    dann hast du sie dauerhaft.
  </p>

  <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">
    Ein Hinweis: In den nächsten Wochen schicke ich dir ein paar kurze Notizen zum Buch
    &ndash; was Thomas gerade durchmacht, warum der Mittelteil der härteste ist,
    wo du dich vermutlich selbst wiedererkennst. Kein Newsletter-Zwang; du kannst jederzeit
    abbestellen.
  </p>

  <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">Lukas</p>

  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E8E5DE;">
    <p style="font-size: 13px; color: #7a7a7a; margin: 0; line-height: 1.6;">Lukas Ebner<br>Wachstumscoach GmbH | HRB 19991, Amtsgericht Regensburg<br>Yorckstr. 22, 93049 Regensburg | Fon: +49 941 463 909 80<br><a href="https://lukasebner.de" style="color: #7a7a7a;">lukasebner.de</a></p>
  </div>

</div>`,
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mailPayload),
      })

      if (!res.ok) {
        const errBody = await res.text()
        console.error('[unverzichtbar/confirm] Download-mail Resend error:', errBody)
      } else {
        const result = await res.json()
        console.log(
          `[unverzichtbar/confirm] Download email sent to ${email} (Resend ID: ${result.id})`
        )
      }
    } catch (err) {
      console.error('[unverzichtbar/confirm] Failed to send download mail:', err)
    }
  } else {
    console.warn('[unverzichtbar/confirm] RESEND_API_KEY not set, skipping download mail')
  }

  // 4. Redirect to thank-you page (absolute URL to avoid Docker container hostname)
  return NextResponse.redirect(`${SITE_URL}/unverzichtbar/danke`)
}
