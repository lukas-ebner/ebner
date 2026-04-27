'use client'

import { useState } from 'react'
import { getUtmParams } from '@/lib/utm'
import { trackEvent } from '@/lib/track'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function OptInForm({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string>('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consent) {
      setStatus('error')
      setMessage('Bitte bestätige die Einwilligung.')
      return
    }
    if (!email.includes('@')) {
      setStatus('error')
      setMessage('Bitte gib eine gültige E-Mail-Adresse ein.')
      return
    }

    setStatus('submitting')
    setMessage('')

    try {
      const utmData = getUtmParams()
      const res = await fetch('/api/unverzichtbar/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          company: company || undefined,
          utm: Object.keys(utmData).length > 0 ? utmData : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Irgendwas ist schiefgegangen.')
        return
      }
      trackEvent('form_submit_unverzichtbar', { form_name: 'unverzichtbar_signup' })
      setStatus('success')
      setMessage(data.message || 'Check deine Mails.')
    } catch {
      setStatus('error')
      setMessage('Netzwerkfehler. Bitte erneut versuchen.')
    }
  }

  const isDark = variant === 'dark'
  const labelColor = isDark ? 'text-white/80' : 'text-[#1B2235]'
  const inputClass = isDark
    ? 'w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand'
    : 'w-full rounded-lg border border-[#D8DFE8] bg-white px-4 py-3 text-[#101323] placeholder:text-[#9aa4b2] focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand'
  const metaText = isDark ? 'text-white/60' : 'text-[#5A6678]'

  if (status === 'success') {
    return (
      <div
        className={`rounded-2xl border p-8 text-center ${
          isDark ? 'border-brand/40 bg-brand/10 text-white' : 'border-brand/40 bg-brand/5 text-[#1B2235]'
        }`}
      >
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand">Check deine Mails</p>
        <h3 className="mt-3 font-display text-2xl leading-tight">{message}</h3>
        <p className={`mt-3 text-sm ${metaText}`}>
          Du findest die Bestätigungs-Mail in der Regel innerhalb einer Minute in deinem Postfach.
          Manchmal landet sie im Spam-Ordner.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={`mb-2 block font-mono text-[11px] uppercase tracking-wide ${labelColor}`}>
            Vorname (optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Thomas"
            className={inputClass}
            disabled={status === 'submitting'}
          />
        </div>
        <div>
          <label className={`mb-2 block font-mono text-[11px] uppercase tracking-wide ${labelColor}`}>
            Firma (optional)
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Maier Maschinenbau GmbH"
            className={inputClass}
            disabled={status === 'submitting'}
          />
        </div>
      </div>

      <div>
        <label className={`mb-2 block font-mono text-[11px] uppercase tracking-wide ${labelColor}`}>
          E-Mail <span className="text-brand">*</span>
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="thomas@deine-firma.de"
          className={inputClass}
          disabled={status === 'submitting'}
        />
      </div>

      <label className={`flex items-start gap-3 text-sm ${metaText}`}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-brand"
          disabled={status === 'submitting'}
        />
        <span>
          Ich möchte &bdquo;(Un)verzichtbar&ldquo; als eBook, PDF und Audiobook per E-Mail erhalten und bin
          einverstanden, dass Lukas Ebner mir gelegentlich kurze Texte rund um das Buch schickt.
          Jederzeit abbestellbar.{' '}
          <a
            href="/datenschutz"
            className="underline underline-offset-2 hover:text-brand"
            target="_blank"
            rel="noopener"
          >
            Datenschutz
          </a>
          .
        </span>
      </label>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full rounded-full bg-brand px-6 py-4 font-mono text-sm uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === 'submitting' ? 'Sende …' : 'Zugang anfordern'}
      </button>

      {status === 'error' && message ? (
        <p className="text-sm text-brand" role="alert">
          {message}
        </p>
      ) : null}

      <p className={`text-xs ${metaText}`}>
        Doppelte Bestätigung · DSGVO-konform · Kein Spam · Abmeldung mit einem Klick
      </p>
    </form>
  )
}
