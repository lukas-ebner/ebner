import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * Reminder Check API
 *
 * GET /api/action-codes/remind
 *   → Checks all action codes, returns those expiring within 7 days
 *     that haven't been redeemed and haven't had a reminder sent yet.
 *
 * POST /api/action-codes/remind
 *   → Marks reminders as sent (called after actually sending emails)
 *   → Body: { codes: ["FRACTO-A3F2B1", ...] }
 *
 * The actual email sending happens externally (Scheduled Task / Resend / etc.)
 * This route just manages the reminder state.
 */

interface ActionCode {
  code: string
  email: string
  company: string
  deadline: string
  createdAt: string
  redeemedAt?: string
  reminderSentAt?: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const CODES_FILE = path.join(DATA_DIR, 'action-codes.json')

async function readCodes(): Promise<ActionCode[]> {
  try {
    const raw = await fs.readFile(CODES_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function writeCodes(codes: ActionCode[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(CODES_FILE, JSON.stringify(codes, null, 2), 'utf-8')
}

// ── GET: Find codes needing reminder ──
export async function GET() {
  const codes = await readCodes()
  const now = new Date()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000

  const needsReminder = codes.filter(c => {
    if (c.redeemedAt) return false       // Already used
    if (c.reminderSentAt) return false   // Already reminded
    const deadline = new Date(c.deadline)
    const daysUntil = deadline.getTime() - now.getTime()
    // Remind if deadline is within 7 days and not yet passed
    return daysUntil > 0 && daysUntil <= sevenDaysMs
  }).map(c => ({
    code: c.code,
    email: c.email,
    company: c.company,
    deadline: c.deadline,
    daysLeft: Math.ceil((new Date(c.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  }))

  return NextResponse.json({ pending: needsReminder, count: needsReminder.length })
}

// ── POST: Mark reminders as sent ──
export async function POST(req: NextRequest) {
  const { codes: sentCodes } = await req.json()

  if (!Array.isArray(sentCodes) || sentCodes.length === 0) {
    return NextResponse.json({ error: 'No codes provided.' }, { status: 400 })
  }

  const codes = await readCodes()
  const now = new Date().toISOString()
  let updated = 0

  for (const code of sentCodes) {
    const found = codes.find(c => c.code === code.toUpperCase())
    if (found && !found.reminderSentAt) {
      found.reminderSentAt = now
      updated++
    }
  }

  await writeCodes(codes)
  return NextResponse.json({ success: true, updated })
}
