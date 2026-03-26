#!/usr/bin/env node
/**
 * ai-detect.mjs
 *
 * Heuristic AI-pattern detection for blog articles.
 * Checks for common AI writing patterns and scores the text.
 *
 * Usage:
 *   node scripts/blog/ai-detect.mjs <path-to-markdown-file>
 *
 * Output: JSON to stdout with { score, issues[], suggestions[] }
 *   score: 0-100 (0 = very human, 100 = very AI-like)
 */

import { readFileSync } from 'fs'

const filePath = process.argv[2]
if (!filePath) {
  console.error('Usage: node ai-detect.mjs <path-to-markdown-file>')
  process.exit(1)
}

const raw = readFileSync(filePath, 'utf-8')
// Strip frontmatter
const content = raw.replace(/^---[\s\S]*?---\n/, '').trim()
const paragraphs = content.split(/\n\n+/).filter((p) => p.trim() && !p.startsWith('#') && !p.startsWith('*['))
const sentences = content
  .replace(/\n/g, ' ')
  .split(/(?<=[.!?])\s+/)
  .filter((s) => s.length > 10)

const issues = []
let totalPenalty = 0

// ── Check 1: AI filler phrases ──
const aiPhrases = [
  'in der heutigen zeit',
  'es ist wichtig zu beachten',
  'zusammenfassend lässt sich sagen',
  'in diesem zusammenhang',
  'es sei darauf hingewiesen',
  'nicht zuletzt',
  'darüber hinaus',
  'es liegt auf der hand',
  'im folgenden',
  'abschließend',
  'es bleibt festzuhalten',
  'in der tat',
  'zweifellos',
  'it is worth noting',
  'in today\'s',
  'it\'s important to',
  'in conclusion',
  'furthermore',
  'moreover',
  'delve',
  'landscape',
  'navigate',
  'leverage',
  'streamline',
  'synergy',
  'holistic',
  'paradigm',
  'game-changer',
  'deep dive',
  'let\'s explore',
  'lass uns erkunden',
  'tauchen wir ein',
  'werfen wir einen blick',
]

const lowerContent = content.toLowerCase()
const foundPhrases = aiPhrases.filter((p) => lowerContent.includes(p))
if (foundPhrases.length > 0) {
  const penalty = Math.min(foundPhrases.length * 8, 30)
  totalPenalty += penalty
  issues.push({
    type: 'ai-phrases',
    severity: foundPhrases.length > 3 ? 'high' : 'medium',
    detail: `${foundPhrases.length} typische AI-Phrasen gefunden: ${foundPhrases.join(', ')}`,
    penalty,
  })
}

// ── Check 2: Sentence length uniformity ──
if (sentences.length >= 5) {
  const lengths = sentences.map((s) => s.split(/\s+/).length)
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length
  const variance = lengths.reduce((sum, l) => sum + (l - avg) ** 2, 0) / lengths.length
  const cv = Math.sqrt(variance) / avg // coefficient of variation

  if (cv < 0.25) {
    totalPenalty += 15
    issues.push({
      type: 'sentence-uniformity',
      severity: 'high',
      detail: `Sätze zu gleichförmig (CV=${cv.toFixed(2)}). Menschliches Schreiben variiert stärker.`,
      penalty: 15,
    })
  } else if (cv < 0.35) {
    totalPenalty += 7
    issues.push({
      type: 'sentence-uniformity',
      severity: 'medium',
      detail: `Satzlängen-Variation könnte höher sein (CV=${cv.toFixed(2)}).`,
      penalty: 7,
    })
  }
}

// ── Check 3: Paragraph start patterns ──
const paraStarts = paragraphs.map((p) => {
  const words = p.trim().split(/\s+/)
  return words.slice(0, 3).join(' ').toLowerCase()
})
const startPatterns = {}
for (const start of paraStarts) {
  const firstWord = start.split(' ')[0]
  startPatterns[firstWord] = (startPatterns[firstWord] || 0) + 1
}
const repetitiveStarts = Object.entries(startPatterns).filter(([, count]) => count > 2)
if (repetitiveStarts.length > 0) {
  const penalty = Math.min(repetitiveStarts.length * 6, 15)
  totalPenalty += penalty
  issues.push({
    type: 'repetitive-starts',
    severity: 'medium',
    detail: `Absätze beginnen oft gleich: ${repetitiveStarts.map(([w, c]) => `"${w}" (${c}x)`).join(', ')}`,
    penalty,
  })
}

// ── Check 4: List/bullet overuse ──
const listLines = content.split('\n').filter((l) => /^\s*[-*•]\s/.test(l) || /^\s*\d+\.\s/.test(l))
const totalLines = content.split('\n').filter((l) => l.trim()).length
const listRatio = listLines.length / totalLines
if (listRatio > 0.4) {
  totalPenalty += 12
  issues.push({
    type: 'list-overuse',
    severity: 'medium',
    detail: `${Math.round(listRatio * 100)}% des Textes sind Listen. Wirkt generiert.`,
    penalty: 12,
  })
}

// ── Check 5: Hedging language density ──
const hedges = ['möglicherweise', 'eventuell', 'könnte', 'es ist möglich', 'unter umständen',
  'gewissermaßen', 'sozusagen', 'im grunde genommen', 'essentially', 'basically', 'potentially']
const hedgeCount = hedges.reduce((count, h) => count + (lowerContent.split(h).length - 1), 0)
const hedgeRatio = hedgeCount / (sentences.length || 1)
if (hedgeRatio > 0.15) {
  totalPenalty += 10
  issues.push({
    type: 'hedging-overuse',
    severity: 'medium',
    detail: `Zu viel Hedging (${hedgeCount} Hedges in ${sentences.length} Sätzen). Wirkt unsicher.`,
    penalty: 10,
  })
}

// ── Check 6: Missing personal voice ──
const personalMarkers = ['ich ', 'mein ', 'meine ', 'meiner ', 'mir ', 'bei uns ', 'wir haben ', 'ich habe ']
const hasPersonalVoice = personalMarkers.some((m) => lowerContent.includes(m))
if (!hasPersonalVoice && paragraphs.length > 5) {
  totalPenalty += 10
  issues.push({
    type: 'missing-personal-voice',
    severity: 'high',
    detail: 'Kein persönlicher Bezug (ich/wir/mein). Lukas\' Artikel brauchen eigene Erfahrung.',
    penalty: 10,
  })
}

// ── Check 7: Transition word overuse ──
const transitions = ['darüber hinaus', 'außerdem', 'zusätzlich', 'des weiteren', 'ferner',
  'ebenso', 'gleichzeitig', 'infolgedessen', 'dementsprechend']
const transitionCount = transitions.reduce((c, t) => c + (lowerContent.split(t).length - 1), 0)
if (transitionCount > paragraphs.length * 0.5) {
  totalPenalty += 8
  issues.push({
    type: 'transition-overuse',
    severity: 'low',
    detail: `Zu viele Übergangswörter (${transitionCount}). Klingt wie ein Schulaufsatz.`,
    penalty: 8,
  })
}

// ── Score ──
const score = Math.min(Math.round(totalPenalty), 100)

// ── Suggestions ──
const suggestions = []
if (score > 30) {
  suggestions.push('Sätze stärker variieren — kurze Sätze (5 Wörter) mit langen (25+) mischen')
  suggestions.push('Mehr persönliche Erfahrungen einbauen ("Bei eins+null habe ich...")')
  suggestions.push('AI-Phrasen durch direkte, umgangssprachliche Formulierungen ersetzen')
}
if (foundPhrases.length > 0) {
  suggestions.push(`Diese Phrasen ersetzen: ${foundPhrases.slice(0, 5).join(', ')}`)
}
if (listRatio > 0.3) {
  suggestions.push('Listen in Fließtext umwandeln — Prosa statt Aufzählung')
}
if (!hasPersonalVoice) {
  suggestions.push('Persönliche Anekdoten und "Ich"-Perspektive einbauen')
}

const output = {
  file: filePath,
  score,
  rating: score < 20 ? 'PASS ✅' : score < 40 ? 'BORDERLINE ⚠️' : 'FAIL ❌',
  wordCount: content.split(/\s+/).length,
  sentenceCount: sentences.length,
  paragraphCount: paragraphs.length,
  issues,
  suggestions,
  timestamp: new Date().toISOString(),
}

console.log(JSON.stringify(output, null, 2))
process.exit(score >= 40 ? 1 : 0)
