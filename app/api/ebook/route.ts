import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { writeFile } from 'fs/promises'
import path from 'path'

/**
 * POST /api/ebook
 *
 * Sends the "Cost of Chaos" ebook PDF to the given email address via Resend.
 * Then spawns the enrichment pipeline in the background (Research → Leadtime CRM).
 *
 * Body: { email: string }
 */

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string }

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'Bitte gib eine gültige E-Mail-Adresse ein.' },
        { status: 400 }
      )
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      console.error('[ebook] RESEND_API_KEY not set')
      return NextResponse.json(
        { error: 'E-Mail-Versand ist aktuell nicht verfügbar.' },
        { status: 500 }
      )
    }

    const payload = {
      from: 'Lukas Ebner <lukas@lukasebner.de>',
      to: [email],
      subject: 'Dein Report: The Cost of Chaos in Professional Services',
      html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">

  <p style="font-size: 16px; line-height: 1.6;">Hi,</p>

  <p style="font-size: 16px; line-height: 1.6;">hier ist dein Report <strong>&ldquo;The Cost of Chaos in Professional Services&rdquo;</strong> &ndash; 10 Fehler, die deine Marge auffressen, und was du dagegen tun kannst.</p>

  <p style="margin: 24px 0;">
    <a href="https://lukasebner.de/images/ebook/ebook.pdf" style="display: inline-block; background: #F44900; color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 16px; font-weight: 600;">Report herunterladen (PDF)</a>
  </p>

  <p style="font-size: 16px; line-height: 1.6;">Hier ein kurzer Überblick, was dich erwartet:</p>

  <ul style="font-size: 15px; line-height: 1.8; color: #333; padding-left: 20px;">
    <li>Warum volle Auslastung nicht gleich Profitabilität ist</li>
    <li>Die 10 häufigsten Margenkiller in Agenturen und IT-Dienstleistern</li>
    <li>Konkrete Maßnahmen, die du sofort umsetzen kannst</li>
  </ul>

  <div style="background: #F5F5F0; padding: 20px; margin: 24px 0; border-left: 4px solid #F44900;">
    <p style="margin: 0 0 8px 0; font-size: 14px; color: #7a7a7a;">Der Report ist der erste Schritt. Wenn du wissen willst, wo dein Unternehmen konkret steht, mach den kostenlosen Freiheitstest auf meiner Seite.</p>
    <p style="margin: 0;">
      <a href="https://lukasebner.de" style="color: #F44900; font-weight: bold; text-decoration: none;">→ Zum Freiheitstest</a>
    </p>
  </div>

  <p style="font-size: 16px; line-height: 1.6;">Wenn du Fragen hast oder über die Ergebnisse sprechen willst &ndash; meld dich einfach.</p>

  <p style="font-size: 16px; line-height: 1.6;">
    <a href="https://lukasebner.de/erstgespraech" style="color: #F44900; font-weight: bold; text-decoration: none;">→ Kostenloses Erstgespräch buchen</a>
  </p>

  <p style="font-size: 16px; line-height: 1.6; margin-top: 32px;">Lukas</p>

  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E8E5DE;">
    <p style="font-size: 13px; color: #7a7a7a; margin: 0; line-height: 1.6;">Lukas Ebner<br>Wachstumcoach GmbH | HRB 19991, Amtsgericht Regensburg<br>Yorckstr. 22, 93049 Regensburg | Fon: +49 941 463 909 80<br><a href="https://lukasebner.de" style="color: #7a7a7a;">lukasebner.de</a></p>
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
      console.error('[ebook] Resend error:', errBody)
      return NextResponse.json(
        { error: 'E-Mail konnte nicht gesendet werden.' },
        { status: 502 }
      )
    }

    const result = await res.json()
    console.log(`[ebook] Email sent to ${email} (Resend ID: ${result.id})`)

    // Spawn enrichment pipeline in background (Research → Leadtime CRM)
    spawnEnrichPipeline(email, 'ebook')

    return NextResponse.json({
      status: 'sent',
      message: 'Der Report ist auf dem Weg zu deinem Postfach.',
    })
  } catch (error) {
    console.error('[ebook] Error:', error)
    return NextResponse.json(
      { error: 'Interner Fehler. Bitte versuche es später noch einmal.' },
      { status: 500 }
    )
  }
}

/**
 * Fire-and-forget: Spawns the Python enrichment pipeline as a background process.
 * Crawls the company website, enriches data, creates Leadtime CRM lead.
 */
function spawnEnrichPipeline(email: string, source: string) {
  const pipelineScript = path.join(process.cwd(), 'lib', 'strategy-pipeline.py')
  const dataDir = path.join(process.cwd(), 'data')
  const logFile = path.join(dataDir, `enrich-${Date.now()}.log`)
  const inputJson = JSON.stringify({ email, source })

  console.log(`[ebook] Spawning enrich pipeline for ${email} (log: ${logFile})`)

  // Write input to temp file
  const tmpFile = path.join(dataDir, `enrich-input-${Date.now()}.json`)
  writeFile(tmpFile, inputJson, 'utf-8')
    .then(() => {
      const pythonCmd = [
        'PYTHON="$(/opt/homebrew/bin/python3 -c \'import fpdf\' 2>/dev/null && echo /opt/homebrew/bin/python3 || echo python3)"',
        `"$PYTHON" "${pipelineScript}" --enrich "$(cat "${tmpFile}")" > "${logFile}" 2>&1`,
        `echo "EXIT: $?" >> "${logFile}"`,
        `rm -f "${tmpFile}"`,
      ].join('; ')

      const child = spawn('bash', ['-lc', pythonCmd], {
        cwd: process.cwd(),
        stdio: 'ignore',
        detached: true,
      })

      child.on('error', (err) => {
        console.error(`[ebook] Enrich pipeline spawn error: ${err.message}`)
      })

      child.unref()
    })
    .catch((err) => {
      console.error(`[ebook] Failed to write enrich input: ${err}`)
    })
}
