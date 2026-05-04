import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { writeFile } from 'fs/promises'
import path from 'path'
import { escapeHtml, isSuspiciousText, validateFormProtection } from '@/lib/form-protection'

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
    const { name, email, company, message, actionCode, utm, website, formStartedAt } = body

    const protection = validateFormProtection(req, {
      honeypot: website,
      formStartedAt,
    })
    if (!protection.ok) {
      return NextResponse.json(
        protection.status === 200 ? { success: true } : { error: protection.message },
        { status: protection.status }
      )
    }

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

    if (isSuspiciousText(name) || isSuspiciousText(company)) {
      return NextResponse.json(
        { error: 'Anfrage konnte nicht verifiziert werden. Bitte Daten prüfen.' },
        { status: 400 }
      )
    }

    if (String(name).trim().length > 120 || String(company).trim().length > 160 || String(email).trim().length > 160) {
      return NextResponse.json(
        { error: 'Bitte gib kürzere Eingaben ein.' },
        { status: 400 }
      )
    }

    const safeName = String(name).trim()
    const safeEmail = String(email).trim()
    const safeCompany = String(company).trim()
    const safeMessage = typeof message === 'string' ? message.trim() : ''
    const safeActionCode = typeof actionCode === 'string' ? actionCode.trim() : ''

    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const emailPayload = {
        from: 'Lukas Ebner Website <lukas@lukasebner.de>',
        to: ['lukas@lukasebner.de'],
        subject: `Erstgespräch-Anfrage von ${safeName} (${safeCompany})`,
        html: `<div style="font-family: -apple-system, sans-serif; max-width: 600px; color: #1a1a1a;">
          <h2 style="color: #F44900;">Neue Erstgespräch-Anfrage</h2>
          <p><strong>Name:</strong> ${escapeHtml(safeName)}</p>
          <p><strong>E-Mail:</strong> ${escapeHtml(safeEmail)}</p>
          <p><strong>Unternehmen:</strong> ${escapeHtml(safeCompany)}</p>
          ${safeMessage ? `<p><strong>Details:</strong></p><p style="white-space: pre-line;">${escapeHtml(safeMessage)}</p>` : ''}
          ${safeActionCode ? `<p><strong>Aktionscode:</strong> ${escapeHtml(safeActionCode)}</p>` : ''}
          ${utm ? `<hr style="margin: 16px 0; border-color: #eee;"/><p style="font-size: 12px; color: #999;"><strong>Attribution:</strong> ${escapeHtml(utm.utm_source || '–')} / ${escapeHtml(utm.utm_medium || '–')} / ${escapeHtml(utm.utm_campaign || '–')}${utm.gclid ? ` (gclid: ${escapeHtml(utm.gclid)})` : ''}</p>` : ''}
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

    spawnEnrichPipeline(safeEmail, 'erstgespraech', {
      name: safeName,
      company: safeCompany,
      message: safeMessage || undefined,
      actionCode: safeActionCode || undefined,
      ...(utm?.utm_source ? { utm_source: utm.utm_source } : {}),
      ...(utm?.utm_medium ? { utm_medium: utm.utm_medium } : {}),
      ...(utm?.utm_campaign ? { utm_campaign: utm.utm_campaign } : {}),
      ...(utm?.gclid ? { gclid: utm.gclid } : {}),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[contact] Error:', error)
    return NextResponse.json(
      { error: 'Beim Senden ist ein Fehler aufgetreten.' },
      { status: 500 }
    )
  }
}

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

