#!/usr/bin/env node
/**
 * generate-image.mjs
 *
 * Generates blog images via NanoBanana API (generate-2 model).
 * Enforces a consistent visual style matching lukasebner.de.
 *
 * Usage:
 *   node scripts/blog/generate-image.mjs "<prompt>" [--aspect 16:9] [--resolution 2K] [--output /path/to/file.jpg]
 *
 * Output: JSON to stdout with { taskId, imageUrl, localPath }
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env
const envPath = resolve(__dirname, '.env')
const envContent = readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const [key, ...vals] = line.split('=')
  if (key && vals.length) process.env[key.trim()] = vals.join('=').trim()
}

const API_KEY = process.env.NANOBANANA_API_KEY
if (!API_KEY) { console.error('NANOBANANA_API_KEY not set'); process.exit(1) }

const BASE_URL = 'https://api.nanobananaapi.ai'

// ── Parse args ──
const args = process.argv.slice(2)
let rawPrompt = ''
let aspect = '16:9'
let resolution = '2K'
let outputPath = ''

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--aspect' && args[i + 1]) { aspect = args[++i]; continue }
  if (args[i] === '--resolution' && args[i + 1]) { resolution = args[++i]; continue }
  if (args[i] === '--output' && args[i + 1]) { outputPath = args[++i]; continue }
  if (!rawPrompt) rawPrompt = args[i]
}

if (!rawPrompt) {
  console.error('Usage: node generate-image.mjs "<prompt>" [--aspect 16:9] [--resolution 2K] [--output path.jpg]')
  process.exit(1)
}

// ── Style prefix for consistent blog imagery ──
const STYLE_PREFIX = `Professional editorial photography style. Clean, modern, minimal.
Muted warm tones with subtle orange accent (#F44900).
Dark moody backgrounds, cinematic lighting, shallow depth of field.
Business/tech context, premium feel. No text overlays, no logos, no stock-photo look.
Style reference: high-end European business magazine editorial.`

const prompt = `${STYLE_PREFIX}\n\nSubject: ${rawPrompt}`

// ── Generate ──
async function generate() {
  console.error(`Generating image: "${rawPrompt}" (${aspect}, ${resolution})...`)

  const res = await fetch(`${BASE_URL}/api/v1/nanobanana/generate-2`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      imageUrls: [],
      aspectRatio: aspect,
      resolution,
      outputFormat: 'jpg',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`NanoBanana API error ${res.status}: ${err}`)
    process.exit(1)
  }

  const data = await res.json()
  const taskId = data.data?.taskId

  if (!taskId) {
    console.error('No taskId returned:', JSON.stringify(data))
    process.exit(1)
  }

  console.error(`Task created: ${taskId}. Polling...`)

  // ── Poll for result ──
  let imageUrl = null
  for (let attempt = 0; attempt < 60; attempt++) {
    await sleep(5000)

    const statusRes = await fetch(`${BASE_URL}/api/v1/nanobanana/record-info?taskId=${taskId}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    })

    if (!statusRes.ok) {
      console.error(`Poll error ${statusRes.status}`)
      continue
    }

    const statusData = await statusRes.json()
    const flag = statusData.data?.successFlag ?? statusData.successFlag

    if (flag === 1) {
      imageUrl = statusData.data?.response?.resultImageUrl
        || statusData.response?.resultImageUrl
      break
    }
    if (flag === 2 || flag === 3) {
      console.error('Generation failed:', JSON.stringify(statusData))
      process.exit(1)
    }

    console.error(`  Still generating... (attempt ${attempt + 1})`)
  }

  if (!imageUrl) {
    console.error('Timeout: image not ready after 5 minutes')
    process.exit(1)
  }

  // ── Download image if output path specified ──
  let localPath = null
  if (outputPath) {
    mkdirSync(dirname(resolve(outputPath)), { recursive: true })
    const imgRes = await fetch(imageUrl)
    const buffer = Buffer.from(await imgRes.arrayBuffer())
    writeFileSync(resolve(outputPath), buffer)
    localPath = resolve(outputPath)
    console.error(`Image saved to: ${localPath}`)
  }

  const output = {
    taskId,
    imageUrl,
    localPath,
    prompt: rawPrompt,
    aspect,
    resolution,
    timestamp: new Date().toISOString(),
  }

  console.log(JSON.stringify(output, null, 2))
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }

generate().catch((err) => {
  console.error('Generation failed:', err.message)
  process.exit(1)
})
