import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

export type ThemenSection =
  | {
      type: 'prose'
      heading?: string
      content?: string[]
      bullets?: string[]
      quote?: string
    }
  | {
      type: 'compare'
      heading: string
      leftTitle: string
      rightTitle: string
      rows: { label: string; left: string; right: string }[]
    }
  | {
      type: 'figure'
      image: string
      alt: string
      caption?: string
    }
  | {
      type: 'crossref'
      heading: string
      body: string
      link?: { label: string; href: string }
    }
  | {
      type: 'faq'
      heading?: string
      items: { question: string; answer: string }[]
    }
  | {
      type: 'bafa-calculator'
      heading?: string
      body?: string
      cta?: { label: string; href: string }
    }
  | {
      type: 'symptoms'
      heading: string
      body?: string
      items: { pill?: string; image?: string; headline: string; body: string }[]
    }
  | {
      type: 'credibility'
      heading: string
      body: string
      proofs?: { text: string }[]
    }

export interface ThemenPage {
  meta: {
    title: string
    description: string
    kicker: string
    subtitle: string
    heroImage?: string
    heroAlt?: string
    breadcrumbs?: { label: string; href: string }[]
    ctas?: { label: string; href: string; variant?: 'primary' | 'secondary' }[]
    og_image?: string
  }
  sections: ThemenSection[]
  endCTA: {
    heading: string
    body: string
    primary: { label: string; href: string }
    secondary?: { label: string; href: string }
  }
}

function themenDir() {
  return path.join(process.cwd(), 'content', 'pages', 'themen')
}

function pagesDir() {
  return path.join(process.cwd(), 'content', 'pages')
}

export function listThemenSlugs(): string[] {
  const dir = themenDir()
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((f) => f.endsWith('.yaml')).map((f) => f.replace(/\.yaml$/, ''))
}

export function loadThemenPage(slug: string): ThemenPage {
  const filePath = path.join(themenDir(), `${slug}.yaml`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return yaml.load(raw) as ThemenPage
}

/**
 * Detect if a root-level YAML (content/pages/{slug}.yaml) uses the ThemenPage schema
 * (has `sections:` key) instead of the slide-based PageBuilder schema.
 */
export function isLandingPageThemenFormat(slug: string): boolean {
  const filePath = path.join(pagesDir(), `${slug}.yaml`)
  if (!fs.existsSync(filePath)) return false
  const raw = fs.readFileSync(filePath, 'utf-8')
  const doc = yaml.load(raw) as Record<string, unknown> | null
  if (!doc || typeof doc !== 'object') return false
  return Array.isArray((doc as { sections?: unknown }).sections)
}

/**
 * Load a root-level landing page in ThemenPage format.
 */
export function loadLandingPageAsThemen(slug: string): ThemenPage {
  const filePath = path.join(pagesDir(), `${slug}.yaml`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return yaml.load(raw) as ThemenPage
}
