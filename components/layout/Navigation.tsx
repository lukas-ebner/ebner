'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, Menu, X } from 'lucide-react'
import { startTransition, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const services = [
  {
    href: '/operations',
    title: 'Operations & Führung',
    desc: 'Strategie, Prozesse, Team – vom Macher zum Unternehmer.',
  },
  {
    href: '/digitalisierung',
    title: 'Systeme & Automatisierung',
    desc: 'Eine Infrastruktur, die mitdenkt – statt 15 Tools.',
  },
  {
    href: '/ki-readiness',
    title: 'KI-Readiness & Prototyping',
    desc: 'Von der Idee zum Prototyp. In Tagen, nicht Monaten.',
  },
]

const themen = [
  {
    href: '/themen',
    title: 'Alle Themen',
    desc: 'Übersicht aller aktuellen und geplanten Themenseiten.',
  },
  {
    href: '/themen/bafa',
    title: 'BAFA-Förderung',
    desc: 'Förderlogik, Ablauf und Umsetzung mit Fokus auf Wirkung.',
  },
  {
    href: '/themen/change-management-beratung',
    title: 'Change Management',
    desc: 'Veränderung im Mittelstand, die auch im Alltag hält.',
  },
  {
    href: '/unternehmensberatung-regensburg',
    title: 'Unternehmensberatung Regensburg',
    desc: 'Ordnung im Betrieb für KMU und Agenturen in Regensburg.',
  },
  {
    href: '/unternehmensberatung-niederbayern',
    title: 'Unternehmensberatung Niederbayern',
    desc: 'Pragmatische Beratung für inhabergeführten Mittelstand.',
  },
  {
    href: '/unternehmensberatung-ostbayern',
    title: 'Unternehmensberatung Ostbayern',
    desc: 'Regionale Verwurzelung, operative Klarheit.',
  },
  {
    href: '/ki-beratung-regensburg',
    title: 'KI-Beratung Regensburg',
    desc: 'KI im Mittelstand ohne Hype-Folien.',
  },
  {
    href: '/digitalisierungsberatung-regensburg',
    title: 'Digitalisierungsberatung Regensburg',
    desc: 'Weniger Tool-Chaos, mehr Klarheit im Alltag.',
  },
  {
    href: '/prozessoptimierung-regensburg',
    title: 'Prozessoptimierung Regensburg',
    desc: 'Weniger Reibung, mehr operative Steuerbarkeit.',
  },
  {
    href: '/operations-beratung-agenturen',
    title: 'Operations-Beratung für Agenturen',
    desc: 'Mehr Klarheit im Projektalltag statt mehr Umsatz.',
  },
]

const navItems = [
  { href: '/projekte', label: 'Beteiligungen' },
  { href: '/preise', label: 'Preise' },
  { href: '/blog', label: 'Blog' },
]

const navItemsAfterThemen = [
  { href: '/ueber-mich', label: 'Über mich' },
]

const ctaButton = { href: '/erstgespraech', label: 'Erstgespräch buchen' }

export function Navigation() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [themenOpen, setThemenOpen] = useState(false)

  useEffect(() => {
    startTransition(() => {
      setServicesOpen(false)
      setThemenOpen(false)
      setMenuOpen(false)
    })
  }, [pathname])

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 48)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  const darkHeroPages = [
    '/',
    '/operations',
    '/digitalisierung',
    '/ki-readiness',
    '/ueber-mich',
    '/preise',
    '/erstgespraech',
    '/projekte',
    '/themen',
    '/themen/bafa',
    '/themen/change-management-beratung',
  ]
  const hasDarkHero = darkHeroPages.includes(pathname)
  const onDarkSurface = hasDarkHero && !scrolled
  const shell = scrolled || !hasDarkHero
    ? 'bg-white/95 text-text-primary shadow-[0_2px_16px_rgba(0,0,0,0.12)] backdrop-blur'
    : 'bg-transparent text-text-light'

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${shell}`}
      >
        <div className="flex h-20 w-full items-center justify-between px-8 lg:px-12">
          <Link href="/" className="relative z-10 flex items-center gap-2">
            <Image
              src="/images/logo/ebner-logo.svg"
              alt="Lukas Ebner"
              width={150}
              height={36}
              sizes="150px"
              style={{ width: 'auto', height: 'auto' }}
              className={
                onDarkSurface
                  ? 'h-8 max-w-[150px] brightness-0 invert'
                  : 'h-8 max-w-[150px]'
              }
              priority
            />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Hauptnavigation">
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                type="button"
                className={`inline-flex items-center font-mono text-sm font-normal uppercase tracking-wide transition-opacity hover:opacity-80 ${
                  onDarkSurface ? 'text-text-light' : 'text-text-primary'
                }`}
                aria-expanded={servicesOpen}
                aria-haspopup="true"
              >
                Leistungen
                <ChevronDown
                  size={14}
                  strokeWidth={1.5}
                  className="ml-1 inline shrink-0"
                  aria-hidden
                />
              </button>
              {servicesOpen ? (
                <div className="absolute left-0 top-full z-50 w-[min(100vw-2rem,420px)] pt-2">
                  <div className="rounded-lg border border-white/10 bg-surface-dark p-4 shadow-xl">
                    <ul className="grid gap-1">
                      {services.map((s) => (
                        <li key={s.href}>
                          <Link
                            href={s.href}
                            className="block rounded-md px-3 py-2.5 font-body text-sm text-text-light/80 transition-colors hover:bg-white/5 hover:text-text-light"
                            onClick={() => setServicesOpen(false)}
                          >
                            <span className="font-medium text-text-light">{s.title}</span>
                            <span className="mt-1 block text-xs text-text-light/50">{s.desc}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-mono text-sm font-normal uppercase tracking-wide transition-opacity hover:opacity-80 ${
                  onDarkSurface ? 'text-text-light' : 'text-text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div
              className="relative"
              onMouseEnter={() => setThemenOpen(true)}
              onMouseLeave={() => setThemenOpen(false)}
            >
              <Link
                href="/themen"
                className={`inline-flex items-center font-mono text-sm font-normal uppercase tracking-wide transition-opacity hover:opacity-80 ${
                  onDarkSurface ? 'text-text-light' : 'text-text-primary'
                }`}
                aria-expanded={themenOpen}
                aria-haspopup="true"
              >
                Themen
                <ChevronDown
                  size={14}
                  strokeWidth={1.5}
                  className="ml-1 inline shrink-0"
                  aria-hidden
                />
              </Link>
              {themenOpen ? (
                <div className="absolute left-0 top-full z-50 w-[min(100vw-2rem,420px)] pt-2">
                  <div className="rounded-lg border border-white/10 bg-surface-dark p-4 shadow-xl">
                    <ul className="grid gap-1">
                      {themen.map((t) => (
                        <li key={t.href}>
                          <Link
                            href={t.href}
                            className="block rounded-md px-3 py-2.5 font-body text-sm text-text-light/80 transition-colors hover:bg-white/5 hover:text-text-light"
                            onClick={() => setThemenOpen(false)}
                          >
                            <span className="font-medium text-text-light">{t.title}</span>
                            <span className="mt-1 block text-xs text-text-light/50">{t.desc}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>

            {navItemsAfterThemen.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-mono text-sm font-normal uppercase tracking-wide transition-opacity hover:opacity-80 ${
                  onDarkSurface ? 'text-text-light' : 'text-text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href={ctaButton.href}
              className="ml-2 rounded-full bg-brand px-5 py-2.5 font-mono text-sm font-normal uppercase tracking-wide text-white transition-opacity hover:opacity-90"
            >
              {ctaButton.label}
            </Link>
          </nav>

          <button
            type="button"
            className={`relative z-10 inline-flex items-center justify-center rounded-button p-2 lg:hidden ${
              onDarkSurface ? 'text-text-light' : 'text-text-primary'
            }`}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">Menü</span>
            {menuOpen ? (
              <X size={24} strokeWidth={1.5} aria-hidden />
            ) : (
              <Menu size={24} strokeWidth={1.5} aria-hidden />
            )}
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-40 flex flex-col bg-surface-dark px-8 pb-12 pt-24 text-text-light lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <p className="font-mono text-label uppercase tracking-widest text-text-muted">
            Leistungen
          </p>
          <ul className="mt-4 space-y-4 border-b border-border-dark pb-8">
            {services.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="block font-display text-h3 font-normal"
                  onClick={() => setMenuOpen(false)}
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-8 font-mono text-label uppercase tracking-widest text-text-muted">Navigation</p>
          <ul className="mt-4 space-y-6">
            <li>
              <Link
                href="/projekte"
                className="font-mono text-label font-normal uppercase tracking-wide"
                onClick={() => setMenuOpen(false)}
              >
                Beteiligungen
              </Link>
            </li>
            <li>
              <Link
                href="/preise"
                className="font-mono text-label font-normal uppercase tracking-wide"
                onClick={() => setMenuOpen(false)}
              >
                Preise
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="font-mono text-label font-normal uppercase tracking-wide"
                onClick={() => setMenuOpen(false)}
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/themen"
                className="font-mono text-label font-normal uppercase tracking-wide"
                onClick={() => setMenuOpen(false)}
              >
                Themen
              </Link>
              <ul className="mt-3 space-y-2 border-l border-white/15 pl-4">
                {themen.slice(1).map((t) => (
                  <li key={t.href}>
                    <Link
                      href={t.href}
                      className="block font-body text-sm text-text-light/70"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <Link
                href="/ueber-mich"
                className="font-mono text-label font-normal uppercase tracking-wide"
                onClick={() => setMenuOpen(false)}
              >
                Über mich
              </Link>
            </li>
          </ul>

          <div className="mt-auto pt-8">
            <Link
              href="/erstgespraech"
              className="block w-full rounded-full bg-brand px-8 py-4 text-center font-mono text-label font-medium uppercase tracking-wider text-white transition-transform hover:scale-[1.02]"
              onClick={() => setMenuOpen(false)}
            >
              Erstgespräch buchen
            </Link>
          </div>
        </div>
      ) : null}
    </>
  )
}
