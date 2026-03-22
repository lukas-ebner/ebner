'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const services = [
  {
    href: '/geschaeftsfuehrer-coaching',
    title: 'GF-Coaching',
    desc: 'Vom Macher zum Unternehmer.',
  },
  {
    href: '/agentur-skalieren',
    title: 'Agentur skalieren',
    desc: 'Prozesse, Margen, Team – systematisch skalieren.',
  },
  {
    href: '/ki-automatisierung',
    title: 'KI & Automatisierung',
    desc: 'KI einführen – wo es sich wirklich lohnt.',
  },
  {
    href: '/vibe-coding-beratung',
    title: 'Vibe Coding',
    desc: 'AI-First Produkte und Prototypen bauen.',
  },
]

const navItems = [
  { href: '/projekte', label: 'Projekte' },
  { href: '/ueber-mich', label: 'Über mich' },
  { href: '/blog', label: 'Blog' },
  { href: '/kontakt', label: 'Kontakt' },
]

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

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

  const onDarkSurface = !scrolled
  const shell = scrolled
    ? 'border-b border-border bg-white/95 text-text-primary shadow-sm backdrop-blur'
    : 'border-b border-transparent bg-transparent text-text-light'

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${shell}`}
      >
        <div className="flex w-full items-center justify-between px-8 py-4 lg:px-12">
          <Link href="/" className="relative z-10 flex items-center gap-2">
            <Image
              src="/images/logo/ebner-logo.svg"
              alt="Lukas Ebner"
              width={120}
              height={28}
              sizes="120px"
              style={{ width: 'auto', height: 'auto' }}
              className={
                onDarkSurface
                  ? 'h-6 max-w-[120px] brightness-0 invert'
                  : 'h-6 max-w-[120px]'
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
                className={`inline-flex items-center font-mono text-label font-normal uppercase tracking-wide transition-opacity hover:opacity-80 ${
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
                <div className="absolute left-0 top-full z-50 mt-2 w-[min(100vw-2rem,420px)] rounded-lg border border-white/10 bg-surface-dark p-4 shadow-xl">
                  <ul className="grid gap-1">
                    {services.map((s) => (
                      <li key={s.href}>
                        <Link
                          href={s.href}
                          className="block rounded-md px-3 py-2.5 font-body text-sm text-text-light/80 transition-colors hover:bg-white/5 hover:text-text-light"
                        >
                          <span className="font-medium text-text-light">{s.title}</span>
                          <span className="mt-1 block text-xs text-text-light/50">{s.desc}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-mono text-label font-normal uppercase tracking-wide transition-opacity hover:opacity-80 ${
                  onDarkSurface ? 'text-text-light' : 'text-text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
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
        </div>
      ) : null}
    </>
  )
}
