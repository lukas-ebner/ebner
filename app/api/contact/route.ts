import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { writeFile } from 'fs/promises'
import path from 'path'

/**
 * POST /api/contact
 *
 * Handles Erstgespräch form submissions:
 * 1. Sends notification email via Resend
 * 2. Spawns enrichment pipeline (Research → Leadtime CRM)
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
          ${message ? `<p><strong>Details:</strong></p><p style="white-space: pre-line;">${message}</p>` : ''}
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

    // 2. Spawn enrichment pipeline in background (Research → Leadtime CRM)
    spawnEnrichPipeline(email, 'erstgespraech', { name, company, message, actionCode })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[contact] Error:', error)
    return NextResponse.json(
      { error: 'Beim Senden ist ein Fehler aufgetreten.' },
      { status: 500 }
    )
  }
}

/**
 * Fire-and-forget: Spawns the Python enrichment pipeline as a background process.
 */
function spawnEnrichPipeline(email: string, source: string, formData?: Record<string, string | undefined>) {
  const pipelineScript = path.join(process.cwd(), 'lib', 'strategy-pipeline.py')
  const dataDir = path.join(process.cwd(), 'data')
  const logFile = path.join(dataDir, `enrich-${Date.now()}.log`)
  const inputJson = JSON.stringify({ email, source, formData })

  console.log(`[contact] Spawning enrich pipeline for ${email} (log: ${logFile})`)

  const tmpFile = path.join(dataDir, `enrich-input-${Date.now()}.json`)
  writeFile(tmpFile, inputJson, 'utf-8')
    .then(() => {
      const pythonCmd = [
        `python3 "${pipelineScript}" --enrich "$(cat "${tmpFile}")" > "${logFile}" 2>&1`,
        `echo "EXIT: $?" >> "${logFile}"`,
        `rm -f "${tmpFile}"`,
      ].join('; ')

      const child = spawn('sh', ['-c', pythonCmd], {
        cwd: process.cwd(),
        stdio: 'ignore',
        detached: true,
      })

      child.on('error', (err) => {
        console.error(`[contact] Enrich pipeline spawn error: ${err.message}`)
      })

      child.unref()
    })
    .catch((err) => {
      console.error(`[contact] Failed to write enrich input: ${err}`)
    })
}
