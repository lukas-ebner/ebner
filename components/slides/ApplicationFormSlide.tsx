'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

interface FormField {
  name: string
  label: string
  type?: 'text' | 'email' | 'url' | 'textarea' | 'select'
  placeholder?: string
  required?: boolean
  options?: string[]
}

interface ApplicationFormSlideProps {
  id?: string
  headline: string
  body?: string
  fields: FormField[]
  submitLabel?: string
  successHeadline?: string
  successBody?: string
  recipientEmail?: string
  variant?: 'light' | 'dark'
}

export function ApplicationFormSlide({
  id,
  headline,
  body,
  fields,
  submitLabel = 'Absenden',
  successHeadline = 'Danke.',
  successBody = 'Ich melde mich innerhalb von 24 Stunden mit einem Terminvorschlag.',
  recipientEmail = 'lukas@lukasebner.de',
  variant = 'dark',
}: ApplicationFormSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const isDark = variant === 'dark'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)
    const form = e.currentTarget
    const data = new FormData(form)

    // Build mailto body
    const lines: string[] = []
    fields.forEach((field) => {
      const value = data.get(field.name)
      if (value) {
        lines.push(`${field.label}: ${value}`)
      }
    })

    const subject = encodeURIComponent(
      `Erstgespräch – ${data.get('company') || data.get('name') || 'Neue Anfrage'}`
    )
    const mailBody = encodeURIComponent(lines.join('\n\n'))
    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${mailBody}`

    // Show success after brief delay
    setTimeout(() => {
      setSubmitted(true)
      setSending(false)
    }, 500)
  }

  return (
    <div
      id={id}
      ref={ref}
      className={isDark ? 'bg-surface-dark' : 'bg-white'}
    >
      <div className="mx-auto max-w-[1600px] px-8 py-32 lg:px-20 lg:py-48">
        {/* ── Section header ── */}
        <motion.div
          className="mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2
            className={`max-w-[700px] font-display text-[2.5rem] font-normal leading-[1.1] md:text-[3.5rem] lg:text-[4.25rem] ${
              isDark ? 'text-text-light' : 'text-text-primary'
            }`}
          >
            {headline}
          </h2>
          {body && (
            <p
              className={`mt-6 max-w-[600px] font-body text-lg leading-relaxed lg:text-xl ${
                isDark ? 'text-text-light/60' : 'text-text-secondary'
              }`}
            >
              {body}
            </p>
          )}
        </motion.div>

        {/* ── Form or Success ── */}
        <motion.div
          className="max-w-[720px]"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        >
          {submitted ? (
            <div className="py-16">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                }`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M2.5 7.5L5.5 10.5L11.5 3.5"
                    stroke={isDark ? '#34D399' : '#059669'}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3
                className={`mt-6 font-display text-[2rem] font-normal leading-tight md:text-[2.5rem] ${
                  isDark ? 'text-text-light' : 'text-text-primary'
                }`}
              >
                {successHeadline}
              </h3>
              <p
                className={`mt-4 max-w-[480px] font-body text-lg leading-relaxed ${
                  isDark ? 'text-text-light/60' : 'text-text-secondary'
                }`}
              >
                {successBody}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {fields.map((field, i) => (
                <div key={i}>
                  <label
                    htmlFor={`field-${field.name}`}
                    className={`mb-2 block font-mono text-xs uppercase tracking-widest ${
                      isDark ? 'text-text-light/40' : 'text-text-muted'
                    }`}
                  >
                    {field.label}
                    {field.required && (
                      <span className="ml-1 text-brand">*</span>
                    )}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      id={`field-${field.name}`}
                      name={field.name}
                      rows={4}
                      required={field.required}
                      placeholder={field.placeholder}
                      className={`w-full resize-none border-0 border-b-2 bg-transparent px-0 py-3 font-body text-lg outline-none transition-colors placeholder:opacity-30 ${
                        isDark
                          ? 'border-white/10 text-text-light placeholder:text-text-light focus:border-white/30'
                          : 'border-text-primary/10 text-text-primary placeholder:text-text-primary focus:border-text-primary/30'
                      }`}
                    />
                  ) : field.type === 'select' && field.options ? (
                    <select
                      id={`field-${field.name}`}
                      name={field.name}
                      required={field.required}
                      className={`w-full border-0 border-b-2 bg-transparent px-0 py-3 font-body text-lg outline-none transition-colors ${
                        isDark
                          ? 'border-white/10 text-text-light focus:border-white/30'
                          : 'border-text-primary/10 text-text-primary focus:border-text-primary/30'
                      }`}
                    >
                      <option value="" className="bg-surface-dark text-text-light">
                        {field.placeholder || 'Bitte wählen'}
                      </option>
                      {field.options.map((opt, j) => (
                        <option
                          key={j}
                          value={opt}
                          className="bg-surface-dark text-text-light"
                        >
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      id={`field-${field.name}`}
                      name={field.name}
                      required={field.required}
                      placeholder={field.placeholder}
                      className={`w-full border-0 border-b-2 bg-transparent px-0 py-3 font-body text-lg outline-none transition-colors placeholder:opacity-30 ${
                        isDark
                          ? 'border-white/10 text-text-light placeholder:text-text-light focus:border-white/30'
                          : 'border-text-primary/10 text-text-primary placeholder:text-text-primary focus:border-text-primary/30'
                      }`}
                    />
                  )}
                </div>
              ))}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex rounded-full bg-brand px-10 py-4 font-mono text-sm uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {sending ? 'Wird gesendet…' : submitLabel}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
