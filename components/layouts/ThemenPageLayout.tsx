import Image from 'next/image'
import Link from 'next/link'
import type { ThemenPage } from '@/lib/themen'
import { BafaCalculatorSlide } from '@/components/slides/BafaCalculatorSlide'

interface Props {
  page: ThemenPage
}

function paragraphWithLinks(text: string, key: string) {
  const parts = text.split(/(\[[^\]]+\]\([^\)]+\))/g)
  return (
    <p key={key} className="text-lg leading-relaxed text-[#253043]">
      {parts.map((part, idx) => {
        const match = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/)
        if (!match) return <span key={`${key}-${idx}`}>{part}</span>
        return (
          <Link key={`${key}-${idx}`} href={match[2]} className="text-brand underline decoration-brand/50 underline-offset-4 hover:decoration-brand">
            {match[1]}
          </Link>
        )
      })}
    </p>
  )
}

export function ThemenPageLayout({ page }: Props) {
  return (
    <main className="bg-white text-[#101323]">
      <article className="w-full">
        <section className="relative overflow-hidden bg-surface-dark pt-32 pb-20 lg:pt-40 lg:pb-24">
          <div className="absolute inset-y-0 right-0 hidden w-[44%] bg-gradient-to-br from-[#25315B] via-[#3A2F55] to-[#6B3C30] opacity-75 lg:block" />
          <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
            <nav className="mb-8 text-sm text-white/65" aria-label="Breadcrumb">
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

            <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">{page.meta.kicker}</p>
                <h1 className="mt-4 font-display text-4xl leading-tight text-white lg:text-6xl">{page.meta.title}</h1>
                <p className="mt-6 max-w-[680px] text-lg leading-relaxed text-white/80">{page.meta.subtitle}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {(page.meta.ctas ?? []).map((cta) => (
                    <Link
                      key={`${cta.label}-${cta.href}`}
                      href={cta.href}
                      className={
                        cta.variant === 'secondary'
                          ? 'rounded-full border border-white/30 px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-white/90 hover:border-white/60'
                          : 'rounded-full bg-brand px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-white hover:opacity-90'
                      }
                    >
                      {cta.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-white/10 bg-[#1A2240] lg:min-h-[340px]">
                {page.meta.heroImage ? (
                  <Image
                    src={page.meta.heroImage}
                    alt={page.meta.heroAlt ?? page.meta.title}
                    fill
                    className="object-cover opacity-80"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto mt-12 w-full max-w-6xl px-6 pb-24 lg:px-8">
          <div className="mx-auto w-full max-w-[980px] space-y-10">
            {page.sections.map((section, index) => {
              if (section.type === 'prose') {
                return (
                  <section key={index} className="rounded-2xl border border-[#E0E6ED] bg-white p-7 lg:p-9">
                    {section.heading ? (
                      <h2 className="mb-5 font-display text-3xl text-[#111830]">
                        {section.heading}
                        <span className="mt-3 block h-[3px] w-16 bg-brand" />
                      </h2>
                    ) : null}
                    <div className="space-y-4">
                      {(section.content ?? []).map((paragraph, pIdx) => paragraphWithLinks(paragraph, `${index}-p-${pIdx}`))}
                    </div>
                    {section.bullets?.length ? (
                      <ul className="mt-5 space-y-2 text-lg text-[#253043]">
                        {section.bullets.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex gap-3">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {section.quote ? (
                      <blockquote className="mt-6 border-l-4 border-brand pl-5 text-xl italic text-[#1F2940]">{section.quote}</blockquote>
                    ) : null}
                  </section>
                )
              }

              if (section.type === 'compare') {
                return (
                  <section key={index} className="rounded-2xl border border-[#DCE3ED] bg-[#F4F7FB] p-7 lg:p-9">
                    <h2 className="mb-6 font-display text-3xl text-[#111830]">
                      {section.heading}
                      <span className="mt-3 block h-[3px] w-16 bg-brand" />
                    </h2>
                    <div className="overflow-hidden rounded-xl border border-[#DEE4EC] bg-white">
                      <table className="w-full text-left">
                        <thead className="bg-[#EEF2F7] text-sm uppercase tracking-wide text-[#4A5568]">
                          <tr>
                            <th className="p-4">Punkt</th>
                            <th className="p-4">{section.leftTitle}</th>
                            <th className="p-4">{section.rightTitle}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="border-t border-[#E8EDF3] align-top">
                              <td className="p-4 font-semibold text-[#1B2235]">{row.label}</td>
                              <td className="p-4 text-[#253043]">{row.left}</td>
                              <td className="p-4 text-[#253043]">{row.right}</td>
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
                  <figure key={index} className="mx-auto w-[min(100%+2.5rem,calc(100%+2.5rem))] -translate-x-2 overflow-hidden rounded-2xl border border-[#DEE4EC] bg-white p-4 lg:w-[min(100%+4rem,calc(100%+4rem))] lg:-translate-x-8 lg:p-5">
                    <div className="relative min-h-[220px] overflow-hidden rounded-xl bg-[#E8EEF4] lg:min-h-[400px]">
                      <Image src={section.image} alt={section.alt} fill className="object-cover" sizes="(max-width: 1200px) 100vw, 1200px" />
                    </div>
                    {section.caption ? <figcaption className="mt-3 text-sm italic text-[#5A6678]">{section.caption}</figcaption> : null}
                  </figure>
                )
              }

              if (section.type === 'crossref') {
                return (
                  <section key={index} className="rounded-2xl border-l-4 border-brand bg-white p-7 lg:p-9">
                    <h3 className="font-display text-2xl text-[#111830]">{section.heading}</h3>
                    <p className="mt-3 text-lg leading-relaxed text-[#263246]">{section.body}</p>
                    {section.link ? (
                      <Link href={section.link.href} className="mt-4 inline-block font-mono text-xs uppercase tracking-wide text-brand hover:opacity-80">
                        {section.link.label}
                      </Link>
                    ) : null}
                  </section>
                )
              }

              if (section.type === 'faq') {
                return (
                  <section key={index} className="rounded-2xl border border-[#E0E6ED] bg-white p-7 lg:p-9">
                    <h2 className="mb-5 font-display text-3xl text-[#111830]">{section.heading ?? 'Häufige Fragen'}</h2>
                    <div className="space-y-3">
                      {section.items.map((item, itemIdx) => (
                        <details key={itemIdx} className="group rounded-xl border border-[#E0E6ED] bg-[#FAFBFC] p-4">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium text-[#172035]">
                            <span>{item.question}</span>
                            <span className="font-mono text-brand group-open:hidden">+</span>
                            <span className="hidden font-mono text-brand group-open:inline">−</span>
                          </summary>
                          <p className="mt-3 leading-relaxed text-[#334056]">{item.answer}</p>
                        </details>
                      ))}
                    </div>
                  </section>
                )
              }

              if (section.type === 'bafa-calculator') {
                return (
                  <div key={index} className="overflow-hidden rounded-2xl border border-[#DDE5F0] bg-white p-2 shadow-[0_12px_30px_rgba(16,19,35,0.08)]">
                    <BafaCalculatorSlide headline={section.heading} body={section.body} cta={section.cta} />
                  </div>
                )
              }

              return null
            })}
          </div>

          <section className="mx-auto mt-14 max-w-[980px] rounded-2xl bg-[#111833] p-8 text-white lg:p-10">
            <h2 className="font-display text-3xl">{page.endCTA.heading}</h2>
            <p className="mt-3 max-w-3xl text-lg text-white/80">{page.endCTA.body}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={page.endCTA.primary.href} className="rounded-full bg-brand px-6 py-3 font-mono text-xs uppercase tracking-wide text-white">
                {page.endCTA.primary.label}
              </Link>
              {page.endCTA.secondary ? (
                <Link href={page.endCTA.secondary.href} className="rounded-full border border-white/30 px-6 py-3 font-mono text-xs uppercase tracking-wide text-white/90">
                  {page.endCTA.secondary.label}
                </Link>
              ) : null}
            </div>
          </section>
        </div>
      </article>
    </main>
  )
}
