#!/usr/bin/env node
/**
 * perplexity-research.mjs
 *
 * Deep-researches a topic via Perplexity API (sonar-pro model).
 *
 * Usage:
 *   node scripts/blog/perplexity-research.mjs "vibe coding" "Was ist Vibe Coding, wie funktioniert es, wer nutzt es, Beispiele, Grenzen"
 *
 * Args:
 *   1: topic (required)
 *   2: research questions / angle (optional)
 *
 * Output: JSON to stdout with { topic, summary, sections[], sources[] }
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env
const envPath = resolve(__dirname, '.env')
const envContent = readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const [key, ...vals] = line.split('=')
  if (key && vals.length) process.env[key.trim()] = vals.join('=').trim()
}

const API_KEY = process.env.PERPLEXITY_API_KEY
if (!API_KEY) { console.error('PERPLEXITY_API_KEY not set'); process.exit(1) }

const topic = process.argv[2]
const angle = process.argv[3] || ''

if (!topic) {
  console.error('Usage: node perplexity-research.mjs "<topic>" ["<research questions>"]')
  process.exit(1)
}

const systemPrompt = `Du bist ein Research-Assistent für einen Blog über Unternehmensführung, Digitalisierung und KI.
Deine Aufgabe: Recherchiere das Thema gründlich und liefere strukturierte Ergebnisse.
Fokus auf: aktuelle Daten, Statistiken, Praxisbeispiele, Expertenmeinungen, deutsche Markt-Perspektive.
Sprache: Deutsch.
Format: Strukturierte Abschnitte mit klaren Überschriften.`

const userPrompt = `Recherchiere ausführlich zum Thema: "${topic}"
${angle ? `\nFokus / Fragestellungen:\n${angle}` : ''}

Liefere:
1. Aktuelle Zahlen und Statistiken (mit Quellen)
2. Expertenmeinungen und Zitate
3. Praxisbeispiele aus dem deutschen Mittelstand
4. Gegenargumente und Kontroversen
5. Trends und Ausblick

Strukturiere die Antwort in klar benannte Abschnitte.`

async function research() {
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4000,
      temperature: 0.3,
      return_citations: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`Perplexity API error ${res.status}: ${err}`)
    process.exit(1)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content || ''
  const citations = data.citations || []

  // Parse sections from markdown
  const sections = []
  const parts = content.split(/^## /gm)
  for (const part of parts) {
    if (!part.trim()) continue
    const lines = part.split('\n')
    const heading = lines[0].trim()
    const body = lines.slice(1).join('\n').trim()
    sections.push({ heading, body })
  }

  const output = {
    topic,
    angle: angle || null,
    summary: content.slice(0, 500) + '...',
    fullContent: content,
    sections,
    sources: citations,
    model: data.model,
    timestamp: new Date().toISOString(),
  }

  console.log(JSON.stringify(output, null, 2))
}

research().catch((err) => {
  console.error('Research failed:', err.message)
  process.exit(1)
})
