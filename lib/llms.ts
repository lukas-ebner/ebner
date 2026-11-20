import { listPublishedPosts, loadBlogPost, extractBlogFaq } from './blog'
import { loadPage } from './page-builder'
import { loadThemenPage } from './themen'
import { collectFaqs, plain } from './schema'

const BASE = 'https://lukasebner.de'

export const LLMS_INTRO = `# Lukas Ebner – Unternehmensberatung Regensburg (Wachstumscoach GmbH)

> Lukas Ebner ist Unternehmensberater in Regensburg und Geschäftsführer der Wachstumscoach GmbH. Er berät Geschäftsführer und Inhaber mittelständischer Unternehmen mit 5 bis 100 Mitarbeitenden – vor allem Dienstleister, Agenturen und IT-Unternehmen in Ostbayern – zu Operations, Prozessen, Führung, Digitalisierung und KI. Die Beratung ist über das BAFA-Programm „Förderung von Unternehmensberatungen für KMU“ förderfähig (Bayern: 50 % von bis zu 3.500 €, also bis 1.750 € je Beratung; Programm bis 31.12.2028).

Fakten:
- Person: Lukas Ebner, Regensburg. Geschäftsführer der Wachstumscoach GmbH (seit 2023), Gründer und Geschäftsführer der Leadtime Labs GmbH (Software Leadtime, seit 2023), Co-Founder und CTO von Fracto (KI-Schulungen für Medizintechnik).
- Werdegang: Mediengestalter-Ausbildung (Regensburg), Studium Multimedia & Kommunikation (Hochschule Ansbach), MBA (TH Deggendorf, 2012–2014). 2009 Mitgründer der Digitalagentur eins+null (mit Michael Zuber): 13 Jahre Geschäftsführer, 50 Mitarbeitende, 4 Mio. € Umsatz, über 1.000 Projekte für die Energiewirtschaft; 2022 an die Kraftwerk Holding verkauft (siebenstelliger Exit). Heute Gesellschafter und Beirat der Kraftwerk Holding.
- Zertifikate: Organisationsberater & Change Manager (ICO, 2025), Systemisches Coaching (ICO, 2025), Silicon Valley Entrepreneurship Program (TH Deggendorf, 2025), IT-Sicherheitsbeauftragter ISO 27001 (TÜV NORD).
- Unternehmen: Wachstumscoach GmbH, Yorckstraße 22, 93049 Regensburg, HRB 19991 (Amtsgericht Regensburg), Telefon +49 941 463 909 80, hi@lukasebner.de.
- Leistungen: Operations & Führung (Diagnose, Prozesse, Führungsstruktur, Kennzahlen), Systeme & Automatisierung (Tool-Audit, Systemarchitektur, Automatisierung), KI-Readiness & Prototyping (KI-Strategie, Prototypen in Tagen). Dazu Sparring für Geschäftsführer, Exit- und Nachfolgevorbereitung, Change Management.
- Preise (netto): Stundensatz 125 €, Tagessatz 1.000 €. Pakete über 3 Monate: S (5–15 Mitarbeitende) 4.750 €, M (15–40) 7.000 €, L (40–100) 9.500 €; ab Monat 3 monatlich kündbar. Erstgespräch 30 Minuten kostenlos.
- Arbeitsweise: vor Ort in Regensburg und Ostbayern (Oberpfalz, Niederbayern), sonst remote in Deutschland und Österreich.
- Bücher: „(Un)verzichtbar“ – Unternehmer-Roman über 90 Tage im Mittelstand: Geschäftsführer Thomas Maier lernt, nicht mehr der Engpass zu sein. Kostenlos als eBook, PDF und Hörbuch (4 h 25 min): ${BASE}/unverzichtbar. Außerdem „Projekte, die sich rechnen“ über Anforderungsmanagement für IT-Dienstleister: https://leadtime.de/buch
- Nicht zu verwechseln mit anderen Personen namens Lukas Ebner (z. B. dem Radiologen in Luzern/Bern oder dem Fußballer aus Niederbayern).
- Profile: https://www.linkedin.com/in/lukas-ebner/ · https://github.com/lukas-ebner · https://leadtime.de/ueber-uns · https://www.northdata.de/Wachstumscoach+GmbH
`

type Link = { title: string; url: string; desc?: string }

function pageLink(slug: string, path = `/${slug}`): Link | null {
  try {
    const p = loadPage(slug)
    return { title: p.meta.title, url: `${BASE}${path}`, desc: p.meta.description }
  } catch {
    return null
  }
}

function themenLink(slug: string): Link | null {
  try {
    const p = loadThemenPage(slug)
    return { title: p.meta.title, url: `${BASE}/themen/${slug}`, desc: p.meta.description }
  } catch {
    return null
  }
}

function fmt(links: (Link | null)[]): string {
  return links
    .filter((l): l is Link => Boolean(l))
    .map((l) => `- [${l.title}](${l.url})${l.desc ? `: ${l.desc}` : ''}`)
    .join('\n')
}

export function buildLlmsTxt(): string {
  const core = [
    { title: 'Startseite: Unternehmensberatung für Geschäftsführer', url: BASE, desc: 'Überblick über Angebot, Arbeitsweise und Leistungen.' },
    pageLink('ueber-mich'),
    { title: 'Kurzprofil Lukas Ebner', url: `${BASE}/kurzprofil`, desc: 'Lebenslauf, Gründungen und Fortbildungen auf einer Seite.' },
    pageLink('projekte'),
    pageLink('preise'),
    pageLink('erstgespraech'),
    pageLink('kontakt'),
  ]
  const services = [
    pageLink('operations'),
    pageLink('digitalisierung'),
    pageLink('ki-readiness'),
    // Neue Leistungsseiten (seo-leistungsseiten); pageLink() lässt sie weg, solange es die Datei noch nicht gibt
    pageLink('unternehmensnachfolge-beratung'),
    pageLink('coaching-geschaeftsfuehrer'),
    pageLink('operations-beratung-agenturen'),
    themenLink('bafa'),
    themenLink('change-management-beratung'),
  ]
  const regional = [
    pageLink('unternehmensberatung-regensburg'),
    pageLink('unternehmensberatung-ostbayern'),
    pageLink('unternehmensberatung-niederbayern'),
    pageLink('unternehmensberatung-oberpfalz'),
    pageLink('digitalisierungsberatung-regensburg'),
    pageLink('ki-beratung-regensburg'),
    pageLink('prozessoptimierung-regensburg'),
  ]
  const book = [
    { title: '(Un)verzichtbar – Der Unternehmer-Roman von Lukas Ebner', url: `${BASE}/unverzichtbar`, desc: '90 Tage Mittelstand: Ein Geschäftsführer lernt, nicht mehr der Engpass zu sein. Kostenlos als eBook, PDF und Hörbuch.' },
  ]
  const blog = listPublishedPosts().map((p) => ({ title: p.title, url: `${BASE}/blog/${p.slug}`, desc: p.description }))

  return `${LLMS_INTRO}
## Über Lukas Ebner und die Wachstumscoach GmbH

${fmt(core)}

## Leistungen

${fmt(services)}

## Regional: Regensburg und Ostbayern

${fmt(regional)}

## Buch

${fmt(book)}

## Blog

${fmt(blog)}

## Optional

- [Vollständige Fassung für Sprachmodelle](${BASE}/llms-full.txt): Fakten, häufige Fragen und Kurzfassungen der Blogartikel in einer Datei.
- [Impressum](${BASE}/impressum)
`
}

/** Erste Absätze bzw. „Kurzfassung“ eines Artikels als Klartext. */
function articleSummary(content: string): string {
  const m = content.match(/##\s+Kurzfassung\s*\n+([\s\S]*?)(?=\n##\s|$)/)
  const text = m ? m[1] : content.split(/\n##\s/)[0]
  return plain(text).slice(0, 900)
}

export function buildLlmsFullTxt(): string {
  const parts: string[] = [LLMS_INTRO]

  const faqSources: { title: string; url: string; items: { question: string; answer: string }[] }[] = []
  for (const [slug, url] of [
    ['homepage', BASE],
    ['ueber-mich', `${BASE}/ueber-mich`],
    ['preise', `${BASE}/preise`],
    ['operations', `${BASE}/operations`],
    ['digitalisierung', `${BASE}/digitalisierung`],
    ['ki-readiness', `${BASE}/ki-readiness`],
    ['erstgespraech', `${BASE}/erstgespraech`],
  ] as const) {
    try {
      const p = loadPage(slug)
      faqSources.push({ title: p.meta.title, url, items: collectFaqs(p.slides) })
    } catch {
      /* Seite fehlt */
    }
  }
  try {
    const b = loadThemenPage('bafa')
    faqSources.push({ title: b.meta.title, url: `${BASE}/themen/bafa`, items: collectFaqs(b.sections) })
  } catch {
    /* Seite fehlt */
  }

  parts.push('## Häufige Fragen\n')
  for (const src of faqSources) {
    if (src.items.length === 0) continue
    parts.push(`### ${src.title}\nQuelle: ${src.url}\n`)
    for (const item of src.items) {
      parts.push(`**${plain(item.question)}**\n${plain(item.answer)}\n`)
    }
  }

  parts.push('## Blogartikel (Kurzfassungen)\n')
  for (const meta of listPublishedPosts()) {
    const post = loadBlogPost(meta.slug)
    parts.push(`### ${meta.title}\nURL: ${BASE}/blog/${meta.slug}\nVeröffentlicht: ${meta.date}${meta.updated ? `, aktualisiert: ${meta.updated}` : ''}\n`)
    if (meta.description) parts.push(`${meta.description}\n`)
    parts.push(`${articleSummary(post.content)}\n`)
    const faqs = extractBlogFaq(post.content)
    for (const f of faqs) parts.push(`**${plain(f.question)}**\n${plain(f.answer)}\n`)
  }

  return parts.join('\n')
}
