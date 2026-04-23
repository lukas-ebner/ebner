'use client'

import { usePathname } from 'next/navigation'
import { LeadmagnetTeaser } from './LeadmagnetTeaser'

/**
 * Renders the LeadmagnetTeaser on every page of the site,
 * right before the footer. Skips pages where the teaser
 * would be redundant or disruptive.
 */
const HIDDEN_PATHS_EXACT = new Set<string>([
  '/unverzichtbar',
  '/unverzichtbar/danke',
  '/erstgespraech',
  '/datenschutz',
  '/impressum',
])

const HIDDEN_PATH_PREFIXES = [
  '/api/',
  '/unverzichtbar/',
]

export function GlobalLeadmagnetTeaser() {
  const pathname = usePathname() || ''

  if (HIDDEN_PATHS_EXACT.has(pathname)) return null
  if (HIDDEN_PATH_PREFIXES.some((p) => pathname.startsWith(p))) return null

  return <LeadmagnetTeaser />
}
