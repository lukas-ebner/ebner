import Image from 'next/image'
import Link from 'next/link'
import { Github, Linkedin } from 'lucide-react'

const footerLinkClass = 'font-body text-sm text-text-muted transition-colors hover:text-brand'

const leistungen = [
  { href: '/operations', label: 'Operations & Führung' },
  { href: '/digitalisierung', label: 'Systeme & Automatisierung' },
  { href: '/ki-readiness', label: 'KI-Readiness & Prototyping' },
]

const mehr = [
  { href: '/projekte', label: 'Beteiligungen' },
  { href: '/ueber-mich', label: 'Über mich' },
  { href: '/blog', label: 'Blog' },
  { href: '/ressourcen', label: 'Ressourcen' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-surface-dark py-16 text-text-light">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo/ebner-logo.svg"
              alt="Lukas Ebner"
              width={120}
              height={28}
              sizes="120px"
              style={{ width: 'auto', height: 'auto' }}
              className="h-6 max-w-[120px] brightness-0 invert"
            />
          </Link>
          <p className="mt-4 font-body text-sm text-text-muted">
            Ein Anstoß. Alles in Bewegung.
          </p>
          <div className="mt-6 flex gap-4">
            <a
              href="https://www.linkedin.com/in/lukasebner"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted transition-colors hover:text-brand"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" strokeWidth={1.5} />
            </a>
            <a
              href="https://github.com/lukas-ebner"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted transition-colors hover:text-brand"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" strokeWidth={1.5} />
            </a>
          </div>
        </div>

        <div>
          <p className="mb-4 font-mono text-pill uppercase tracking-widest text-text-muted">
            Leistungen
          </p>
          <ul className="space-y-3">
            {leistungen.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={footerLinkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 font-mono text-pill uppercase tracking-widest text-text-muted">
            Mehr
          </p>
          <ul className="space-y-3">
            {mehr.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={footerLinkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 font-mono text-pill uppercase tracking-widest text-text-muted">
            Kontakt
          </p>
          <p className="font-body text-sm text-text-muted">Wachstumscoach GmbH</p>
          <p className="mt-1 font-body text-sm text-text-muted">Yorckstraße 22</p>
          <p className="font-body text-sm text-text-muted">93049 Regensburg</p>
          <a
            href="tel:+499414639098​0"
            className="mt-3 inline-block font-body text-sm text-text-muted transition-colors hover:text-brand"
          >
            +49 941 463 909 80
          </a>
          <br />
          <a
            href="mailto:hi@lukasebner.de"
            className="mt-1 inline-block font-body text-sm text-text-muted transition-colors hover:text-brand"
          >
            hi@lukasebner.de
          </a>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-border-dark px-6 pt-6">
        <div className="flex flex-col gap-4 text-sm text-text-dimmed md:flex-row md:items-center md:justify-between">
          <p>
            © {year} Lukas Ebner · Wachstumscoach GmbH
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/impressum" className="transition-colors hover:text-brand">
              Impressum
            </Link>
            <span aria-hidden className="text-border-dark">
              ·
            </span>
            <Link href="/datenschutz" className="transition-colors hover:text-brand">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
