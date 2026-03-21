export function parseStatTarget(raw: string): number | null {
  const normalized = raw.replace(/\./g, '')
  const match = normalized.match(/\d+/g)
  if (!match || !match[0]) return null
  return parseInt(match[0], 10)
}

export function formatStatDisplay(raw: string, animated: number): string {
  if (/\d{1,3}\.\d{3}/.test(raw)) {
    const suffix = raw.trim().endsWith('+') ? '+' : ''
    return `${new Intl.NumberFormat('de-DE').format(animated)}${suffix}`
  }
  if (raw.includes('+')) return `${animated}+`
  return String(animated)
}
