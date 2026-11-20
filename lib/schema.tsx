/**
 * Strukturierte Daten (schema.org, JSON-LD) für lukasebner.de.
 *
 * Ein globaler Entity-Graph (Person, Organisation, Website) steht im Root-Layout.
 * Seiten referenzieren ihn nur noch über die festen @ids, statt Person und
 * Organisation jedes Mal neu (und widersprüchlich) zu beschreiben.
 * Ziel: Suchmaschinen und KI-Assistenten sollen eindeutig erkennen, wer
 * Lukas Ebner ist, was die Wachstumscoach GmbH anbietet und wie beides
 * mit Leadtime, eins+null und den Büchern zusammenhängt.
 */

export const SITE_URL = 'https://lukasebner.de'

export const IDS = {
  person: `${SITE_URL}/#person`,
  org: `${SITE_URL}/#organization`,
  website: `${SITE_URL}/#website`,
  book: `${SITE_URL}/unverzichtbar#book`,
} as const

/** Die Person auf leadtime.de trägt diese @id – so verbinden sich beide Graphen. */
const LEADTIME_PERSON_ID = 'https://leadtime.de/#lukas'
const LEADTIME_ORG_ID = 'https://leadtime.de/#org'

export const PERSON_SAME_AS = [
  'https://www.linkedin.com/in/lukas-ebner/',
  'https://github.com/lukas-ebner',
  'https://leadtime.de/ueber-uns',
  'https://alumninet.th-deg.de/wp-content/uploads/Lukas-Ebner.pdf',
]

export const ORG_SAME_AS = [
  'https://maps.google.com/?cid=16792953394205601909',
  'https://www.northdata.de/Wachstumscoach+GmbH',
  'https://de.trustpilot.com/review/lukasebner.de',
]

const ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: 'Yorckstraße 22',
  postalCode: '93049',
  addressLocality: 'Regensburg',
  addressRegion: 'Bayern',
  addressCountry: 'DE',
}

export const PERSON_DESCRIPTION =
  'Lukas Ebner ist Unternehmensberater in Regensburg und Geschäftsführer der Wachstumscoach GmbH. ' +
  'Er hat die Digitalagentur eins+null 2009 mitgegründet, auf rund 50 Mitarbeitende und 4 Mio. € Umsatz aufgebaut ' +
  'und 2022 an die Kraftwerk Holding verkauft. Seit 2023 entwickelt er mit der Leadtime Labs GmbH die Software Leadtime ' +
  'für Agenturen und IT-Dienstleister. Er berät Geschäftsführer mittelständischer Unternehmen zu Operations, Prozessen, ' +
  'Führung, Digitalisierung und KI und ist BAFA-registrierter Berater.'

export const ORG_DESCRIPTION =
  'Die Wachstumscoach GmbH aus Regensburg ist die Unternehmensberatung von Lukas Ebner für Geschäftsführer ' +
  'mittelständischer Unternehmen mit 5 bis 100 Mitarbeitenden, vor allem Dienstleister, Agenturen und IT-Unternehmen in Ostbayern. ' +
  'Schwerpunkte: Operations & Führung, Systeme & Automatisierung sowie KI-Readiness & Prototyping. ' +
  'Die Beratung ist über das BAFA-Programm „Förderung von Unternehmensberatungen für KMU“ förderfähig.'

const KNOWS_ABOUT = [
  'Unternehmensberatung',
  'Operations Management',
  'Prozessoptimierung',
  'Skalierung von Dienstleistungsunternehmen',
  'Agenturführung',
  'Exit-Vorbereitung',
  'Unternehmensnachfolge',
  'Change Management',
  'Digitalisierung im Mittelstand',
  'Künstliche Intelligenz im Mittelstand',
  'Projektmanagement-Software',
  'BAFA-Beratungsförderung',
]

function offer(name: string, description: string, url: string, price?: string) {
  return {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name,
      description,
      url: `${SITE_URL}${url}`,
      provider: { '@id': IDS.org },
      areaServed: AREA_SERVED,
    },
    ...(price
      ? {
          priceSpecification: {
            '@type': 'PriceSpecification',
            price,
            priceCurrency: 'EUR',
            valueAddedTaxIncluded: false,
          },
        }
      : {}),
  }
}

const AREA_SERVED = [
  { '@type': 'City', name: 'Regensburg' },
  { '@type': 'AdministrativeArea', name: 'Oberpfalz' },
  { '@type': 'AdministrativeArea', name: 'Niederbayern' },
  { '@type': 'State', name: 'Bayern' },
  { '@type': 'Country', name: 'Deutschland' },
  { '@type': 'Country', name: 'Österreich' },
]

export const personNode = {
  '@type': 'Person',
  '@id': IDS.person,
  name: 'Lukas Ebner',
  givenName: 'Lukas',
  familyName: 'Ebner',
  url: `${SITE_URL}/ueber-mich`,
  image: `${SITE_URL}/images/lukas.png`,
  jobTitle: 'Unternehmensberater und Geschäftsführer',
  description: PERSON_DESCRIPTION,
  email: 'mailto:hi@lukasebner.de',
  telephone: '+49 941 46390980',
  address: ADDRESS,
  homeLocation: { '@type': 'City', name: 'Regensburg' },
  nationality: { '@type': 'Country', name: 'Deutschland' },
  worksFor: [
    { '@id': IDS.org },
    { '@type': 'Organization', '@id': LEADTIME_ORG_ID, name: 'Leadtime Labs GmbH', url: 'https://leadtime.de' },
    { '@type': 'Organization', name: 'Fracto GmbH', url: 'https://fracto.de' },
  ],
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'Technische Hochschule Deggendorf', url: 'https://www.th-deg.de' },
    { '@type': 'CollegeOrUniversity', name: 'Hochschule Ansbach', url: 'https://www.hs-ansbach.de' },
  ],
  hasCredential: [
    { '@type': 'EducationalOccupationalCredential', name: 'MBA, Technische Hochschule Deggendorf', credentialCategory: 'degree' },
    { '@type': 'EducationalOccupationalCredential', name: 'Organisationsberater & Change Manager (ICO Institut)', credentialCategory: 'certificate' },
    { '@type': 'EducationalOccupationalCredential', name: 'Systemisches Coaching (ICO Institut)', credentialCategory: 'certificate' },
    { '@type': 'EducationalOccupationalCredential', name: 'IT-Sicherheitsbeauftragter ISO 27001 (TÜV NORD)', credentialCategory: 'certificate' },
    { '@type': 'EducationalOccupationalCredential', name: 'Silicon Valley Entrepreneurship Program (TH Deggendorf)', credentialCategory: 'certificate' },
  ],
  knowsAbout: KNOWS_ABOUT,
  knowsLanguage: ['de', 'en'],
  sameAs: [...PERSON_SAME_AS, LEADTIME_PERSON_ID],
}

export const organizationNode = {
  '@type': ['ProfessionalService', 'Organization'],
  '@id': IDS.org,
  name: 'Wachstumscoach GmbH',
  legalName: 'Wachstumscoach GmbH',
  alternateName: ['Lukas Ebner Unternehmensberatung', 'Lukas Ebner – Wachstumscoach'],
  url: SITE_URL,
  logo: `${SITE_URL}/images/favicon.svg`,
  image: `${SITE_URL}/images/lukas.png`,
  description: ORG_DESCRIPTION,
  email: 'hi@lukasebner.de',
  telephone: '+49 941 46390980',
  address: ADDRESS,
  foundingDate: '2023-03-07',
  foundingLocation: { '@type': 'City', name: 'Regensburg' },
  founder: { '@id': IDS.person },
  employee: { '@id': IDS.person },
  identifier: {
    '@type': 'PropertyValue',
    propertyID: 'Handelsregister',
    value: 'HRB 19991, Amtsgericht Regensburg',
  },
  priceRange: '125 €/h · Pakete ab 4.750 €',
  currenciesAccepted: 'EUR',
  areaServed: AREA_SERVED,
  knowsAbout: KNOWS_ABOUT,
  slogan: 'Dein Unternehmen soll laufen. Nicht an dir hängen.',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Beratungsleistungen der Wachstumscoach GmbH',
    itemListElement: [
      offer(
        'Operations & Führung',
        'Diagnose, Prozesse, Führungsstruktur und Kennzahlen, damit das Unternehmen nicht mehr am Geschäftsführer hängt.',
        '/operations',
      ),
      offer(
        'Systeme & Automatisierung',
        'Tool-Audit, Systemarchitektur und Automatisierung von Zeiterfassung über Controlling bis Rechnung.',
        '/digitalisierung',
      ),
      offer(
        'KI-Readiness & Prototyping',
        'KI-Beratung mit Fokus auf die größten Hebel und Prototypen in Tagen statt Monaten.',
        '/ki-readiness',
      ),
      offer('Beratungspaket S (5–15 Mitarbeitende, 3 Monate)', 'Setup und Begleitung über drei Monate.', '/preise', '4750'),
      offer('Beratungspaket M (15–40 Mitarbeitende, 3 Monate)', 'Setup und Begleitung über drei Monate.', '/preise', '7000'),
      offer('Beratungspaket L (40–100 Mitarbeitende, 3 Monate)', 'Setup und Begleitung über drei Monate.', '/preise', '9500'),
      offer('Sparring und Einzelberatung (Stundensatz)', 'Stundensatz 125 € netto, Tagessatz 1.000 € netto.', '/preise', '125'),
      offer(
        'BAFA-geförderte Unternehmensberatung',
        'Beratung im Rahmen des BAFA-Programms „Förderung von Unternehmensberatungen für KMU“, Zuschuss in Bayern 50 % von bis zu 3.500 €.',
        '/themen/bafa',
      ),
    ],
  },
  sameAs: ORG_SAME_AS,
}

export const websiteNode = {
  '@type': 'WebSite',
  '@id': IDS.website,
  url: SITE_URL,
  name: 'Lukas Ebner – Unternehmensberatung Regensburg',
  inLanguage: 'de-DE',
  publisher: { '@id': IDS.org },
  author: { '@id': IDS.person },
}

export function globalGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [personNode, organizationNode, websiteNode],
  }
}

export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

/** Markdown-/Inline-Formatierung für Schema-Texte entfernen. */
export function plain(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function faqPage(items: { question: string; answer: string }[], pagePath: string) {
  return {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}${pagePath}#faq`,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: plain(item.question),
      acceptedAnswer: { '@type': 'Answer', text: plain(item.answer) },
    })),
  }
}

export function webPage(opts: {
  path: string
  name: string
  description?: string
  type?: string
  about?: string
  mainEntity?: string
}) {
  return {
    '@type': opts.type ?? 'WebPage',
    '@id': `${SITE_URL}${opts.path}#webpage`,
    url: `${SITE_URL}${opts.path}`,
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    inLanguage: 'de-DE',
    isPartOf: { '@id': IDS.website },
    about: { '@id': opts.about ?? IDS.org },
    ...(opts.mainEntity ? { mainEntity: { '@id': opts.mainEntity } } : {}),
  }
}

export function jsonLdGraph(nodes: unknown[]) {
  return { '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) }
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  )
}

// ── Seiten-Schemas ─────────────────────────────────────────────────────────

const SERVICE_PAGES: Record<string, { name: string; area?: string[] }> = {
  operations: { name: 'Operations & Führung' },
  digitalisierung: { name: 'Systeme & Automatisierung' },
  'ki-readiness': { name: 'KI-Readiness & Prototyping' },
  'gpt-audit': { name: 'GPT-Audit' },
  'operations-beratung-agenturen': { name: 'Operations-Beratung für Agenturen' },
  'unternehmensberatung-regensburg': { name: 'Unternehmensberatung Regensburg', area: ['Regensburg', 'Landkreis Regensburg', 'Oberpfalz'] },
  'unternehmensberatung-ostbayern': { name: 'Unternehmensberatung Ostbayern', area: ['Ostbayern', 'Oberpfalz', 'Niederbayern'] },
  'unternehmensberatung-niederbayern': { name: 'Unternehmensberatung Niederbayern', area: ['Niederbayern', 'Landshut', 'Straubing', 'Passau', 'Deggendorf'] },
  'digitalisierungsberatung-regensburg': { name: 'Digitalisierungsberatung Regensburg', area: ['Regensburg', 'Oberpfalz'] },
  'ki-beratung-regensburg': { name: 'KI-Beratung Regensburg', area: ['Regensburg', 'Oberpfalz', 'Bayern'] },
  'prozessoptimierung-regensburg': { name: 'Prozessoptimierung Regensburg', area: ['Regensburg', 'Oberpfalz'] },
  'change-management-beratung': { name: 'Change-Management-Beratung', area: ['Regensburg', 'Oberpfalz', 'Ostbayern'] },
  bafa: { name: 'BAFA-geförderte Unternehmensberatung', area: ['Regensburg', 'Oberpfalz', 'Niederbayern', 'Bayern'] },
}

const PAGE_NAMES: Record<string, string> = {
  'ueber-mich': 'Über mich',
  kurzprofil: 'Kurzprofil',
  preise: 'Preise',
  projekte: 'Beteiligungen',
  kontakt: 'Kontakt',
  erstgespraech: 'Erstgespräch',
  impressum: 'Impressum',
  datenschutz: 'Datenschutz',
  literatur: 'Literatur',
}

type FaqItem = { question: string; answer: string }

/** FAQ-Einträge aus Slides (template: faq) oder Themen-Sektionen (type: faq) einsammeln. */
export function collectFaqs(blocks: unknown[] | undefined): FaqItem[] {
  const out: FaqItem[] = []
  for (const b of blocks ?? []) {
    const block = b as { template?: string; type?: string; items?: FaqItem[] }
    if ((block.template === 'faq' || block.type === 'faq') && Array.isArray(block.items)) {
      for (const item of block.items) {
        if (item?.question && item?.answer) out.push(item)
      }
    }
  }
  return out
}

/**
 * Schema für Inhaltsseiten unter /[slug] und /themen/[slug].
 * `path` ist der kanonische Pfad (z. B. "/preise" oder "/themen/bafa").
 */
export function contentPageSchema(opts: {
  slug: string
  path: string
  title: string
  description?: string
  blocks?: unknown[]
  isArticle?: boolean
}) {
  const { slug, path, title, description } = opts
  const nodes: unknown[] = []
  const isProfile = slug === 'ueber-mich' || slug === 'kurzprofil'
  const service = SERVICE_PAGES[slug]

  nodes.push(
    webPage({
      path,
      name: title,
      description,
      type: isProfile ? 'ProfilePage' : slug === 'kontakt' || slug === 'erstgespraech' ? 'ContactPage' : 'WebPage',
      about: isProfile ? IDS.person : IDS.org,
      mainEntity: isProfile ? IDS.person : undefined,
    }),
  )

  nodes.push(
    breadcrumb([
      { name: 'Startseite', path: '/' },
      { name: service?.name ?? PAGE_NAMES[slug] ?? title, path },
    ]),
  )

  if (service) {
    nodes.push({
      '@type': 'Service',
      '@id': `${SITE_URL}${path}#service`,
      name: service.name,
      serviceType: service.name,
      description,
      url: `${SITE_URL}${path}`,
      provider: { '@id': IDS.org },
      areaServed: (service.area ?? ['Regensburg', 'Ostbayern', 'Bayern', 'Deutschland']).map((name) => ({
        '@type': 'Place',
        name,
      })),
      audience: {
        '@type': 'BusinessAudience',
        name: 'Geschäftsführer und Inhaber mittelständischer Unternehmen (5–100 Mitarbeitende)',
      },
    })
  }

  if (opts.isArticle) {
    nodes.push({
      '@type': 'Article',
      '@id': `${SITE_URL}${path}#article`,
      headline: title,
      description,
      mainEntityOfPage: { '@id': `${SITE_URL}${path}#webpage` },
      author: { '@id': IDS.person },
      publisher: { '@id': IDS.org },
      inLanguage: 'de-DE',
    })
  }

  const faqs = collectFaqs(opts.blocks)
  if (faqs.length > 0) nodes.push(faqPage(faqs, path))

  return jsonLdGraph(nodes)
}
