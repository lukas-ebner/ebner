import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { writeFile } from 'fs/promises'
import path from 'path'
import { validateFormProtection } from '@/lib/form-protection'

/**
 * POST /api/strategy-paper
 *
 * Triggers the strategy paper pipeline:
 * Research → AI Analysis → PDF → Action Code → Email
 *
 * Body: {
 *   email: string,
 *   quiz: { score, answers, pillar_scores, top_pillars }
 * }
 *
 * Returns immediately with { status: "processing" }
 * Pipeline runs in background, sends PDF via email when done.
 */

interface QuizAnswer {
  q: string
  a: number
  label: string
}

interface QuizData {
  score: number
  answers: Record<string, QuizAnswer>
  pillar_scores: {
    operations: number
    systeme: number
    ki: number
  }
  top_pillars: string[]
}

interface UtmParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  gclid?: string
}

interface RequestBody {
  email: string
  quiz: QuizData
  chat_context?: string
  utm?: UtmParams
  website?: string
  formStartedAt?: number | string
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json()
    const { email, quiz, chat_context, utm, website, formStartedAt } = body

    const protection = validateFormProtection(req, {
      honeypot: website,
      formStartedAt,
    })
    if (!protection.ok) {
      return NextResponse.json(
        protection.status === 200
          ? { status: 'processing', message: 'Dein Strategiepapier wird erstellt. Du erhältst es in wenigen Minuten per E-Mail.' }
          : { error: protection.message },
        { status: protection.status }
      )
    }

    if (!email || !quiz || quiz.score === undefined || !quiz.pillar_scores) {
      return NextResponse.json(
        { error: 'Missing required fields: email, quiz' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Write input to temp file (avoids CLI arg escaping issues)
    const formData = utm ? Object.fromEntries(Object.entries(utm).filter(([, v]) => v)) : undefined
    const inputJson = JSON.stringify({
      email,
      quiz,
      ...(chat_context ? { chat_context } : {}),
      ...(formData && Object.keys(formData).length ? { formData } : {}),
    })
    const dataDir = path.join(process.cwd(), 'data')
    const tmpFile = path.join(dataDir, `pipeline-input-${Date.now()}.json`)
    await writeFile(tmpFile, inputJson, 'utf-8')

    // Run pipeline in background via shell (most reliable cross-platform)
    const pipelineScript = path.join(process.cwd(), 'lib', 'strategy-pipeline.py')
    const logFile = path.join(dataDir, `pipeline-${Date.now()}.log`)

    console.log(`[strategy-pipeline] Starting pipeline for ${email}`)
    console.log(`[strategy-pipeline] Input: ${tmpFile}`)
    console.log(`[strategy-pipeline] Log: ${logFile}`)

    const pythonCmd = [
      `python3 "${pipelineScript}" "$(cat "${tmpFile}")" > "${logFile}" 2>&1`,
      `echo "EXIT: $?" >> "${logFile}"`,
      `rm -f "${tmpFile}"`,
    ].join('; ')

    const child = spawn(
      'sh',
      ['-c', pythonCmd],
      {
        cwd: process.cwd(),
        stdio: 'ignore',
        detached: true,
      }
    )

    child.on('error', (err) => {
      console.error(`[strategy-pipeline] SPAWN ERROR: ${err.message}`)
    })

    child.unref()

    // Leadtime CRM lead creation happens inside the Python pipeline
    // (after research, so enriched company data is available)

    return NextResponse.json({
      status: 'processing',
      message: 'Dein Strategiepapier wird erstellt. Du erhältst es in wenigen Minuten per E-Mail.',
    })
  } catch (error) {
    console.error('[strategy-paper] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
