'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface ContactFormSlideProps {
  headline: string
  subtext?: string
  email?: string
  phone?: string
  address?: string
  socials?: { label: string; url: string }[]
  slideIndex?: number
}

export function ContactFormSlide({
  headline,
  subtext,
  email,
  phone,
  address,
  socials,
  slideIndex = 1,
}: ContactFormSlideProps) {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="bg-surface-light py-section-mobile lg:py-section-desktop">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-8 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:px-16">
        {/* Left: Contact info */}
        <div>
          {slideIndex === 0 ? (
            <h1 className="font-display text-h2 font-normal text-text-primary">
              {headline}
            </h1>
          ) : (
            <h2 className="font-display text-h2 font-normal text-text-primary">
              {headline}
            </h2>
          )}
          {subtext ? (
            <p className="mt-4 font-body text-body leading-relaxed text-text-dimmed">
              {subtext}
            </p>
          ) : null}

          <div className="mt-10 space-y-5">
            {email ? (
              <div>
                <p className="font-mono text-pill uppercase tracking-widest text-text-dimmed">
                  E-Mail
                </p>
                <a
                  href={`mailto:${email}`}
                  className="mt-1 block font-body text-lg text-text-primary hover:text-brand"
                >
                  {email}
                </a>
              </div>
            ) : null}
            {phone ? (
              <div>
                <p className="font-mono text-pill uppercase tracking-widest text-text-dimmed">
                  Telefon
                </p>
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="mt-1 block font-body text-lg text-text-primary hover:text-brand"
                >
                  {phone}
                </a>
              </div>
            ) : null}
            {address ? (
              <div>
                <p className="font-mono text-pill uppercase tracking-widest text-text-dimmed">
                  Standort
                </p>
                <p className="mt-1 font-body text-lg text-text-primary">
                  {address}
                </p>
              </div>
            ) : null}
            {socials && socials.length > 0 ? (
              <div className="flex flex-wrap gap-3 pt-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-text-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-text-dimmed transition-colors hover:border-brand hover:text-brand"
                  >
                    {s.label} ↗
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: Form */}
        <div>
          {submitted ? (
            <div className="flex h-full items-center justify-center rounded-xl bg-white p-12 text-center shadow-sm">
              <div>
                <p className="font-display text-2xl font-normal text-text-primary">
                  Danke für deine Nachricht.
                </p>
                <p className="mt-3 font-body text-body text-text-dimmed">
                  Ich melde mich in der Regel innerhalb von 24 Stunden.
                </p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const form = e.currentTarget
                const data = new FormData(form)
                // Submit to email via mailto fallback or API
                const subject = encodeURIComponent(
                  `Anfrage von ${data.get('name')}`
                )
                const body = encodeURIComponent(
                  `Name: ${data.get('name')}\nE-Mail: ${data.get('email')}\nUnternehmen: ${data.get('company')}\n\n${data.get('message')}`
                )
                window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
                setSubmitted(true)
              }}
              className="space-y-5 rounded-xl bg-white p-8 shadow-sm lg:p-10"
            >
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block font-mono text-pill uppercase tracking-widest text-text-dimmed"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full rounded-lg border border-text-primary/10 px-4 py-3 font-body text-body text-text-primary outline-none transition-colors focus:border-brand"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block font-mono text-pill uppercase tracking-widest text-text-dimmed"
                >
                  E-Mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full rounded-lg border border-text-primary/10 px-4 py-3 font-body text-body text-text-primary outline-none transition-colors focus:border-brand"
                />
              </div>
              <div>
                <label
                  htmlFor="company"
                  className="mb-1.5 block font-mono text-pill uppercase tracking-widest text-text-dimmed"
                >
                  Unternehmen
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="w-full rounded-lg border border-text-primary/10 px-4 py-3 font-body text-body text-text-primary outline-none transition-colors focus:border-brand"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block font-mono text-pill uppercase tracking-widest text-text-dimmed"
                >
                  Nachricht
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full resize-none rounded-lg border border-text-primary/10 px-4 py-3 font-body text-body text-text-primary outline-none transition-colors focus:border-brand"
                />
              </div>
              <Button type="submit" variant="primary" className="w-full">
                Nachricht senden
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
