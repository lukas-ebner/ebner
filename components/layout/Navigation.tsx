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

const navItems = [
  { href: '/projekte', label: 'Beteiligungen' },
  { href: '/ueber-mich', label: 'Über mich' },
  { href: '/preise', label: 'Preise' },
  { href: '/blog', label: 'Blog' },
]

const ctaButton = { href: '/erstgespraech', label: 'Erstgespräch buchen' }

export function Navigation() {
  const pathname = usePathname()
  const isHomepage = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

  useEffect(() => {
    startTransition(() => {
      setServicesOpen(false)
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

  const darkHeroPages = ['/', '/operations', '/digitalisierung', '/ki-readiness', '/ueber-mich', '/preise', '/erstgespraech', '/projekte']
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
          <ul className="mt-8 space-y-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-mono text-label font-normal uppercase tracking-wide"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
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
