#!/usr/bin/env node
/**
 * publish.mjs
 *
 * Sets a blog article's status to "published" and updates the date.
 *
 * Usage:
 *   node scripts/blog/publish.mjs <slug>
 *
 * What it does:
 *   1. Reads content/blog/<slug>.md
 *   2. Sets status: published, updates date to today
 *   3. Writes back
 *   4. Outputs JSON confirmation
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const slug = process.argv[2]
if (!slug) {
  console.error('Usage: node publish.mjs <slug>')
  process.exit(1)
}

const blogDir = resolve(process.cwd(), 'content', 'blog')
const filePath = resolve(blogDir, `${slug}.md`)

let content
try {
  content = readFileSync(filePath, 'utf-8')
} catch {
  console.error(`File not found: ${filePath}`)
  process.exit(1)
}

const today = new Date().toISOString().split('T')[0]

// Update frontmatter
let updated = content
  .replace(/^status:\s*.*$/m, 'status: published')
  .replace(/^date:\s*.*$/m, `date: "${today}"`)

writeFileSync(filePath, updated, 'utf-8')

const output = {
  slug,
  file: filePath,
  status: 'published',
  date: today,
  timestamp: new Date().toISOString(),
}

console.log(JSON.stringify(output, null, 2))
console.error(`✅ Published: ${slug} (${today})`)
