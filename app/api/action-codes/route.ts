import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * Action Code API
 *
 * POST /api/action-codes         → Create a new code (called by paper generator)
 * GET  /api/action-codes?code=X  → Validate a code (called by form)
 *
 * Storage: JSON file in /data/action-codes.json
 * Each code has: code, email, company, deadline, createdAt, redeemedAt?
 */

interface ActionCode {
  code: string
  email: string
  company: string
  deadline: string          // ISO date string
  createdAt: string         // ISO date string
  redeemedAt?: string       // ISO date, set when used
  reminderSentAt?: string   // ISO date, set when reminder email sent
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

// ── GET: Validate a code ──
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.trim().toUpperCase()

  if (!code) {
    return NextResponse.json({ valid: false, error: 'Kein Code angegeben.' }, { status: 400 })
  }

  const codes = await readCodes()
  const found = codes.find(c => c.code === code)

  if (!found) {
    return NextResponse.json({ valid: false, error: 'Ungültiger Aktionscode.' })
  }

  const now = new Date()
  const deadline = new Date(found.deadline)

  if (now > deadline) {
    return NextResponse.json({
      valid: false,
      error: 'Dieser Aktionscode ist leider abgelaufen.',
      expired: true,
      deadline: found.deadline,
    })
  }

  if (found.redeemedAt) {
    return NextResponse.json({
      valid: false,
      error: 'Dieser Aktionscode wurde bereits eingelöst.',
      redeemed: true,
    })
  }

  return NextResponse.json({
    valid: true,
    company: found.company,
    deadline: found.deadline,
    daysLeft: Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  })
}

// ── POST: Create or redeem a code ──
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body

  if (action === 'create') {
    // Called by paper generator to register a new code
    const { code, email, company, deadline } = body

    if (!code || !email || !deadline) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const codes = await readCodes()

    // Upsert: update if code already exists (re-generation)
    const existing = codes.findIndex(c => c.code === code)
    const entry: ActionCode = {
      code: code.toUpperCase(),
      email,
      company: company || '',
      deadline,
      createdAt: new Date().toISOString(),
    }

    if (existing >= 0) {
      codes[existing] = { ...codes[existing], ...entry }
    } else {
      codes.push(entry)
    }

    await writeCodes(codes)
    return NextResponse.json({ success: true, code: entry.code })
  }

  if (action === 'redeem') {
    // Called when form is submitted with a valid code
    const { code } = body
    if (!code) {
      return NextResponse.json({ error: 'No code provided.' }, { status: 400 })
    }

    const codes = await readCodes()
    const found = codes.find(c => c.code === code.toUpperCase())

    if (!found) {
      return NextResponse.json({ error: 'Code not found.' }, { status: 404 })
    }

    found.redeemedAt = new Date().toISOString()
    await writeCodes(codes)

    return NextResponse.json({ success: true, redeemed: true })
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
}
