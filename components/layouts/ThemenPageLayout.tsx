import Image from 'next/image'
import Link from 'next/link'
import type { ThemenPage } from '@/lib/themen'
import { BafaCalculatorSlide } from '@/components/slides/BafaCalculatorSlide'
import { FAQSlide } from '@/components/slides/FAQSlide'

interface Props {
  page: ThemenPage
}

function paragraphWithLinks(text: string, key: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g)
  return (
    <p key={key} className="text-lg leading-relaxed text-[#253043]">
      {parts.map((part, idx) => {
        const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (!match) return <span key={`${key}-${idx}`}>{part}</span>
        return (
          <Link
            key={`${key}-${idx}`}
            href={match[2]}
            className="text-brand underline decoration-brand/40 underline-offset-4 hover:decoration-brand"
          >
            {match[1]}
          </Link>
        )
      })}
    </p>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 font-display text-[2rem] leading-tight text-[#111830] lg:text-[2.5rem]">
      <span className="mb-3 block h-[2px] w-10 bg-brand" />
      {children}
    </h2>
  )
}

export function ThemenPageLayout({ page }: Props) {
  const hasFaq = page.sections.some((s) => s.type === 'faq')
  const nonFaqSections = page.sections.filter((s) => s.type !== 'faq')
  const faqSection = page.sections.find((s) => s.type === 'faq')

  return (
    <main className="bg-white text-[#101323]">
      <article className="w-full">
        {/* ── HERO ────────────────────────────────────── */}
        <section className="relative min-h-[560px] overflow-hidden bg-surface-dark pt-28 lg:min-h-[640px] lg:pt-32">
          {page.meta.heroImage ? (
            <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
              <Image
                src={page.meta.heroImage}
                alt={page.meta.heroAlt ?? page.meta.title}
                fill
                priority
                className="object-cover"
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-dark via-surface-dark/40 to-transparent" />
            </div>
          ) : null}

          <div className="relative mx-auto flex min-h-[480px] max-w-6xl flex-col justify-center px-6 pb-16 lg:min-h-[560px] lg:px-8 lg:pb-20">
            <nav className="mb-6 text-sm text-white/65" aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2">
                {(page.meta.breadcrumbs ?? [
                  { label: 'Start', href: '/' },
                  { label: 'Themen', href: '/themen' },
                ]).map((crumb, idx, arr) => (
                  <li key={crumb.href} className="flex items-center gap-2">
                    <Link href={crumb.href} className="hover:text-white">
                      {crumb.label}
                    </Link>
                    {idx < arr.length - 1 ? <span>/</span> : null}
                  </li>
                ))}
              </ol>
            </nav>

            <div className="max-w-[640px]">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">{page.meta.kicker}</p>
              <h1 className="mt-4 font-display text-4xl leading-[1.05] text-white lg:text-[3.75rem]">
                {page.meta.title}
              </h1>
              <p className="mt-6 max-w-[560px] text-lg leading-relaxed text-white/80">{page.meta.subtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {(page.meta.ctas ?? []).map((cta) => (
                  <Link
                    key={`${cta.label}-${cta.href}`}
                    href={cta.href}
                    className={
                      cta.variant === 'secondary'
                        ? 'rounded-full border border-white/30 px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-white/90 transition-colors hover:border-white/60'
                        : 'rounded-full bg-brand px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90'
                    }
                  >
                    {cta.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {page.meta.heroImage ? (
            <div className="relative h-[280px] w-full lg:hidden">
              <Image
                src={page.meta.heroImage}
                alt={page.meta.heroAlt ?? page.meta.title}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          ) : null}
        </section>

        {/* ── CONTENT SECTIONS ───────────────────────── */}
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-16 lg:px-8 lg:pt-28">
          <div className="space-y-20">
            {nonFaqSections.map((section, index) => {
              if (section.type === 'prose') {
                return (
                  <section key={index}>
                    {section.heading ? <SectionHeading>{section.heading}</SectionHeading> : null}
                    <div className="space-y-5">
                      {(section.content ?? []).map((paragraph, pIdx) =>
                        paragraphWithLinks(paragraph, `${index}-p-${pIdx}`)
                      )}
                    </div>
                    {section.bullets?.length ? (
                      <ul className="mt-6 space-y-3 text-lg text-[#253043]">
                        {section.bullets.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex gap-3">
                            <span className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {section.quote ? (
                      <blockquote className="mt-8 border-l-4 border-brand pl-5 text-xl italic text-[#1F2940]">
                        {section.quote}
                      </blockquote>
                    ) : null}
                  </section>
                )
              }

              if (section.type === 'compare') {
                return (
                  <section key={index}>
                    <SectionHeading>{section.heading}</SectionHeading>
                    <div className="-mx-6 overflow-x-auto lg:mx-0">
                      <table className="w-full min-w-[640px] border-collapse text-left">
                        <thead>
                          <tr className="border-b border-[#D8DFE8]">
                            <th className="py-4 pr-4 text-xs font-medium uppercase tracking-wider text-[#5A6678]">
                              Punkt
                            </th>
                            <th className="py-4 pr-4 text-xs font-medium uppercase tracking-wider text-[#5A6678]">
                              {section.leftTitle}
                            </th>
                            <th className="py-4 pr-4 text-xs font-medium uppercase tracking-wider text-[#5A6678]">
                              {section.rightTitle}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-[#E8EDF3] align-top">
                              <td className="py-5 pr-4 text-base font-semibold text-[#1B2235]">{row.label}</td>
                              <td className="py-5 pr-4 text-base text-[#253043]">{row.left}</td>
                              <td className="py-5 pr-4 text-base text-[#253043]">{row.right}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )
              }

              if (section.type === 'figure') {
                return (
                  <figure key={index} className="space-y-3">
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#E8EEF4]">
                      <Image
                        src={section.image}
                        alt={section.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 896px"
                      />
                    </div>
                    {section.caption ? (
                      <figcaption className="text-sm italic text-[#5A6678]">{section.caption}</figcaption>
                    ) : null}
                  </figure>
                )
              }

              if (section.type === 'crossref') {
                return (
                  <section key={index} className="border-l-2 border-brand pl-6">
                    <h3 className="font-display text-2xl text-[#111830]">{section.heading}</h3>
                    <p className="mt-3 text-lg leading-relaxed text-[#263246]">{section.body}</p>
                    {section.link ? (
                      <Link
                        href={section.link.href}
                        className="mt-4 inline-block font-mono text-xs uppercase tracking-wide text-brand hover:opacity-80"
                      >
                        {section.link.label} →
                      </Link>
                    ) : null}
                  </section>
                )
              }

              if (section.type === 'bafa-calculator') {
                return (
                  <div key={index} className="-mx-6 overflow-hidden lg:-mx-8">
                    <BafaCalculatorSlide
                      headline={section.heading}
                      body={section.body}
                      cta={section.cta}
                      fullScreen={false}
                    />
                  </div>
                )
              }

              if (section.type === 'symptoms') {
                return (
                  <section key={index}>
                    <SectionHeading>{section.heading}</SectionHeading>
                    {section.body ? (
                      <p className="mb-10 max-w-3xl text-lg leading-relaxed text-[#253043]">{section.body}</p>
                    ) : null}
                    <div className="grid gap-6 md:grid-cols-2">
                      {section.items.map((item, idx) => (
                        <article
                          key={idx}
                          className="overflow-hidden rounded-2xl border border-[#E0E6ED] bg-white"
                        >
                          {item.image ? (
                            <div className="relative aspect-[16/9] w-full bg-[#E8EEF4]">
                              <Image
                                src={item.image}
                                alt={item.headline}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 448px"
                              />
                            </div>
                          ) : null}
                          <div className="p-6">
                            {item.pill ? (
                              <p className="mb-3 inline-block rounded-full bg-brand/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-brand">
                                {item.pill}
                              </p>
                            ) : null}
                            <h3 className="font-display text-xl leading-tight text-[#111830]">{item.headline}</h3>
                            <p className="mt-3 text-base leading-relaxed text-[#253043]">{item.body}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )
              }

              if (section.type === 'credibility') {
                return (
                  <section key={index}>
                    <SectionHeading>{section.heading}</SectionHeading>
                    <p className="max-w-3xl text-lg leading-relaxed text-[#253043]">{section.body}</p>
                    {section.proofs?.length ? (
                      <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {section.proofs.map((p, pIdx) => (
                          <li
                            key={pIdx}
                            className="rounded-xl border border-[#E0E6ED] bg-[#FAFBFC] px-5 py-4 text-sm leading-snug text-[#253043]"
                          >
                            {p.text}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                )
              }

              return null
            })}
          </div>
        </div>

        {/* ── FAQ (full-width, matches main site) ─────── */}
        {hasFaq && faqSection && faqSection.type === 'faq' ? (
          <FAQSlide
            headline={faqSection.heading ?? 'Häufige Fragen'}
            items={faqSection.items}
            variant="light"
            bg="#F6F7FA"
          />
        ) : null}

        {/* ── END CTA ─────────────────────────────────── */}
        <section className="bg-surface-dark py-20 text-white lg:py-24">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <h2 className="font-display text-[2rem] leading-tight lg:text-[2.75rem]">{page.endCTA.heading}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">{page.endCTA.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={page.endCTA.primary.href}
                className="rounded-full bg-brand px-6 py-3 font-mono text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90"
              >
                {page.endCTA.primary.label}
              </Link>
              {page.endCTA.secondary ? (
                <Link
                  href={page.endCTA.secondary.href}
                  className="rounded-full border border-white/30 px-6 py-3 font-mono text-xs uppercase tracking-wide text-white/90 transition-colors hover:border-white/60"
                >
                  {page.endCTA.secondary.label}
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      </article>
    </main>
  )
}
