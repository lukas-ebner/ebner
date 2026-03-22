#!/usr/bin/env node
/**
 * catalog-images.mjs
 *
 * Scans /public/images/{fotos,paintings,teams} and catalogs each image
 * using Claude Vision API. Outputs a JSON catalog to /content/image-catalog.json.
 *
 * Usage:
 *   node scripts/catalog-images.mjs              # catalog all images
 *   node scripts/catalog-images.mjs --force      # re-catalog everything (ignore existing)
 *   node scripts/catalog-images.mjs --dir fotos  # only catalog one directory
 *
 * Requires: ANTHROPIC_API_KEY in .env
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs'
import { join, extname } from 'path'

// Manual .env parsing (no dotenv dependency needed)
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const envPath = join(ROOT, '.env')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx > 0) {
      process.env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1)
    }
  }
}

const API_KEY = process.env.ANTHROPIC_API_KEY
if (!API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY not found in .env')
  process.exit(1)
}

const IMAGES_DIR = join(ROOT, 'public', 'images')
const CATALOG_PATH = join(ROOT, 'content', 'image-catalog.json')
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])

// ── CLI args ────────────────────────────────────────────
const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const DIR_FILTER = args.includes('--dir') ? args[args.indexOf('--dir') + 1] : null
const DIRS = DIR_FILTER ? [DIR_FILTER] : ['fotos', 'paintings', 'teams']

// ── Rate limiting ───────────────────────────────────────
const CONCURRENCY = 3
const DELAY_MS = 500 // between batches

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ── Load existing catalog ───────────────────────────────
let catalog = {}
if (existsSync(CATALOG_PATH) && !FORCE) {
  try {
    catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf-8'))
    console.log(`📂 Loaded existing catalog with ${Object.keys(catalog).length} entries`)
  } catch {
    catalog = {}
  }
}

// ── Collect images to process ───────────────────────────
const toProcess = []

for (const dir of DIRS) {
  const dirPath = join(IMAGES_DIR, dir)
  if (!existsSync(dirPath)) {
    console.warn(`⚠️  Directory not found: ${dir}`)
    continue
  }

  const files = readdirSync(dirPath).filter(f => {
    const ext = extname(f).toLowerCase()
    return IMAGE_EXTENSIONS.has(ext)
  })

  for (const file of files) {
    const relativePath = `/images/${dir}/${file}`
    if (!FORCE && catalog[relativePath]) {
      continue // already cataloged
    }
    toProcess.push({
      relativePath,
      absolutePath: join(dirPath, file),
      directory: dir,
      filename: file,
    })
  }
}

console.log(`🔍 Found ${toProcess.length} new images to catalog across [${DIRS.join(', ')}]`)

if (toProcess.length === 0) {
  console.log('✅ Catalog is up to date.')
  process.exit(0)
}

// ── Claude Vision API call ──────────────────────────────
async function describeImage(imgInfo) {
  const { absolutePath, directory, filename } = imgInfo
  const ext = extname(filename).toLowerCase()
  const mediaType = ext === '.png' ? 'image/png'
    : ext === '.webp' ? 'image/webp'
    : ext === '.avif' ? 'image/avif'
    : 'image/jpeg'

  // Read and base64 encode
  const fileBuffer = readFileSync(absolutePath)
  const fileSize = statSync(absolutePath).size

  // Skip files > 15MB (Claude limit ~20MB base64)
  if (fileSize > 15 * 1024 * 1024) {
    console.warn(`⚠️  Skipping ${filename} (${(fileSize / 1024 / 1024).toFixed(1)}MB - too large)`)
    return null
  }

  const base64 = fileBuffer.toString('base64')

  const systemPrompt = `You are an image cataloger for a personal consulting website (lukasebner.de).
Describe images concisely in a structured JSON format. The website uses an "oil painting" visual style for illustrations
and black-and-white photography for team/people shots. The site owner is Lukas Ebner, a business consultant and former agency founder.

Respond ONLY with valid JSON, no markdown fences.`

  const userPrompt = `Catalog this image from the "${directory}" directory (filename: ${filename}).

Return this exact JSON structure:
{
  "description": "One sentence describing what's in the image",
  "subject": "Main subject (e.g. 'person', 'team', 'abstract scene', 'metaphor', 'landscape')",
  "style": "Visual style (e.g. 'oil painting', 'b&w photography', 'color photography', 'illustration')",
  "mood": "Emotional mood (e.g. 'energetic', 'contemplative', 'dramatic', 'warm', 'professional')",
  "colors": ["dominant", "secondary", "accent"],
  "metaphor": "If this is an illustration/painting, what business metaphor could it represent? null if photo",
  "people": "none | single | pair | small group | large group",
  "orientation": "landscape | portrait | square",
  "suggested_use": ["hero", "split-slide", "card-bg", "full-image", "cta-bg", "profile"],
  "tags": ["tag1", "tag2", "tag3"]
}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64,
            },
          },
          {
            type: 'text',
            text: userPrompt,
          },
        ],
      }],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`API error ${response.status}: ${errText}`)
  }

  const result = await response.json()
  const text = result.content[0].text.trim()

  try {
    return JSON.parse(text)
  } catch {
    console.warn(`⚠️  Could not parse JSON for ${filename}, storing raw text`)
    return { raw_description: text, parse_error: true }
  }
}

// ── Process in batches ──────────────────────────────────
async function processBatch(batch) {
  return Promise.all(batch.map(async (imgInfo) => {
    try {
      const description = await describeImage(imgInfo)
      if (description) {
        catalog[imgInfo.relativePath] = {
          ...description,
          directory: imgInfo.directory,
          filename: imgInfo.filename,
          cataloged_at: new Date().toISOString(),
        }
        console.log(`  ✅ ${imgInfo.directory}/${imgInfo.filename}`)
      }
    } catch (err) {
      console.error(`  ❌ ${imgInfo.directory}/${imgInfo.filename}: ${err.message}`)
      catalog[imgInfo.relativePath] = {
        error: err.message,
        directory: imgInfo.directory,
        filename: imgInfo.filename,
        cataloged_at: new Date().toISOString(),
      }
    }
  }))
}

// ── Main ────────────────────────────────────────────────
console.log(`\n🚀 Starting cataloging...\n`)

let processed = 0
for (let i = 0; i < toProcess.length; i += CONCURRENCY) {
  const batch = toProcess.slice(i, i + CONCURRENCY)
  await processBatch(batch)
  processed += batch.length

  // Save after each batch (crash-safe)
  writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2))

  const pct = Math.round((processed / toProcess.length) * 100)
  console.log(`  📊 Progress: ${processed}/${toProcess.length} (${pct}%)`)

  if (i + CONCURRENCY < toProcess.length) {
    await sleep(DELAY_MS)
  }
}

// ── Summary ─────────────────────────────────────────────
const entries = Object.keys(catalog)
const errors = entries.filter(k => catalog[k].error)
const valid = entries.filter(k => !catalog[k].error)

console.log(`\n📋 Catalog complete!`)
console.log(`   Total entries: ${entries.length}`)
console.log(`   Successful: ${valid.length}`)
console.log(`   Errors: ${errors.length}`)
console.log(`   Saved to: ${CATALOG_PATH}`)
