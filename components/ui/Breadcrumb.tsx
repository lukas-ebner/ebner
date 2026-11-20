import Link from 'next/link'

export interface BreadcrumbItem {
  name: string
  /** Ohne href = aktuelle Seite (letztes Element) */
  href?: string
}

/** Sichtbare Breadcrumb-Navigation; das JSON-LD dazu erzeugt `breadcrumb()` in lib/schema. */
export function Breadcrumb({ items, tone = 'light' }: { items: BreadcrumbItem[]; tone?: 'light' | 'dark' }) {
  const base = tone === 'light' ? 'text-white/60' : 'text-text-muted'
  const hover = tone === 'light' ? 'hover:text-white' : 'hover:text-brand'
  const current = tone === 'light' ? 'text-white/85' : 'text-text-primary'
  return (
    <nav aria-label="Brotkrumen-Navigation" className={`font-mono text-xs ${base}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => (
          <li key={`${item.name}-${i}`} className="flex min-w-0 items-center gap-2">
            {i > 0 && <span aria-hidden>/</span>}
            {item.href ? (
              <Link href={item.href} className={`transition-colors ${hover}`}>
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className={`line-clamp-1 ${current}`}>
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
