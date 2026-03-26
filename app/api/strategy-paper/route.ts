import { NextRequest, NextResponse } from 'next/server'
import { spawn, execSync } from 'child_process'
import path from 'path'
import { createLead } from '@/lib/leadtime'

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

interface RequestBody {
  email: string
  quiz: QuizData
}

// Resolve python3 path once at startup
let python3Path = 'python3'
try {
  python3Path = execSync('which python3', { encoding: 'utf-8' }).trim()
} catch {
  try {
    python3Path = execSync('which python', { encoding: 'utf-8' }).trim()
  } catch {
    console.warn('[strategy-paper] No python3 found in PATH')
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json()
    const { email, quiz } = body

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

    // Run pipeline in background (fire-and-forget)
    const pipelineScript = path.join(process.cwd(), 'lib', 'strategy-pipeline.py')
    const inputJson = JSON.stringify({ email, quiz })

    console.log(`[strategy-pipeline] Starting: ${python3Path} ${pipelineScript}`)
    console.log(`[strategy-pipeline] CWD: ${process.cwd()}`)
    console.log(`[strategy-pipeline] Email: ${email}, Score: ${quiz.score}`)

    const child = spawn(python3Path, [pipelineScript, inputJson], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        // Ensure PATH includes common python locations (macOS)
        PATH: `${process.env.PATH || ''}:/usr/local/bin:/opt/homebrew/bin:/usr/bin`,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
    })

    child.on('error', (err) => {
      console.error(`[strategy-pipeline] SPAWN ERROR: ${err.message}`)
    })

    // Log output for debugging (non-blocking)
    child.stdout?.on('data', (data: Buffer) => {
      console.log(`[strategy-pipeline] ${data.toString().trim()}`)
    })
    child.stderr?.on('data', (data: Buffer) => {
      console.error(`[strategy-pipeline:err] ${data.toString().trim()}`)
    })
    child.on('close', (code: number | null) => {
      if (code === 0) {
        console.log(`[strategy-pipeline] Pipeline completed successfully`)
      } else {
        console.error(`[strategy-pipeline] Pipeline FAILED with exit code ${code}`)
      }
    })

    // Detach so it continues if the HTTP connection closes
    child.unref()

    // Create lead in Leadtime CRM (fire-and-forget)
    const pillarLabels: Record<string, string> = {
      operations: 'Operations & Führung',
      systeme: 'Systeme & Automatisierung',
      ki: 'KI-Readiness',
    }
    createLead({
      email,
      source: 'freiheitstest',
      quizScore: quiz.score,
      quizTopPillars: quiz.top_pillars?.map((p: string) => pillarLabels[p] || p),
    }).catch((err) => console.error('[strategy-paper] Lead creation failed:', err))

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
