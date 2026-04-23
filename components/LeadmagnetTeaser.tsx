import Image from 'next/image'
import Link from 'next/link'

/**
 * LeadmagnetTeaser – reusable banner that links to /unverzichtbar
 *
 * Variants:
 *  - "light"  (default): soft grey panel, sits between content sections
 *  - "dark"            : surface-dark panel, heavier pull (use sparingly)
 *
 * Used on the homepage, all /themen/*, geo-LPs and static pages
 * to nudge readers toward the (Un)verzichtbar lead magnet.
 */
export function LeadmagnetTeaser({
  variant = 'light',
  heading = '(Un)verzichtbar — der Unternehmer-Roman.',
  body = '90 Tage Mittelstand. Ein Geschäftsführer, der lernt, nicht mehr der Engpass zu sein. Als eBook, PDF und Audiobook kostenlos.',
  cta = 'Kostenlos lesen & hören',
}: {
  variant?: 'light' | 'dark'
  heading?: string
  body?: string
  cta?: string
}) {
  const isDark = variant === 'dark'

  const shell = isDark
    ? 'bg-surface-dark text-white'
    : 'bg-[#F6F7FA] text-[#101323]'
  const border = isDark ? 'border-white/10' : 'border-[#E0E6ED]'
  const meta = isDark ? 'text-brand' : 'text-brand'
  const bodyClass = isDark ? 'text-white/75' : 'text-[#334056]'
  const btnClass = isDark
    ? 'rounded-full bg-brand px-6 py-3 font-mono text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90'
    : 'rounded-full bg-brand px-6 py-3 font-mono text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90'
  const subCtaClass = isDark
    ? 'inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wide text-white/70 transition-colors hover:text-white'
    : 'inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wide text-[#5A6678] transition-colors hover:text-[#101323]'

  return (
    <section className="py-14 lg:py-20">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className={`overflow-hidden rounded-2xl border ${shell} ${border}`}>
          <div className="grid grid-cols-1 items-center gap-6 p-6 md:grid-cols-[minmax(0,1fr)_220px] md:gap-10 md:p-10">
            <div>
              <p className={`font-mono text-[11px] uppercase tracking-[0.14em] ${meta}`}>
                Leadtime Publishing · Leadmagnet
              </p>
              <h3 className="mt-3 font-display text-2xl leading-tight lg:text-[1.875rem]">
                {heading}
              </h3>
              <p className={`mt-3 text-base leading-relaxed ${bodyClass}`}>{body}</p>

              <div className="mt-6 flex flex-wrap items-center gap-5">
                <Link href="/unverzichtbar" className={btnClass}>
                  {cta}
                </Link>
                <Link href="/unverzichtbar" className={subCtaClass}>
                  Worum es geht →
                </Link>
              </div>
            </div>

            <div className="relative mx-auto aspect-[3/4] w-[160px] md:w-[200px]">
              <Image
                src="/images/leadmagnet/buch_transparent.png"
                alt="(Un)verzichtbar – Buchmockup"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 160px, 200px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
