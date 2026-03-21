import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import type { PageConfig } from './types'

export function loadPage(slug: string): PageConfig {
  const filePath = path.join(process.cwd(), 'content', 'pages', `${slug}.yaml`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return yaml.load(raw) as PageConfig
}

export function listPageSlugs(): string[] {
  const dir = path.join(process.cwd(), 'content', 'pages')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => f.replace(/\.yaml$/, ''))
}
