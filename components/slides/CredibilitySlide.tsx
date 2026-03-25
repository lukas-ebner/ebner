'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { ExternalLink, Send } from 'lucide-react'
import type { ImageConfig } from '@/lib/types'

interface Proof {
  text: string
}

interface SecondaryCta {
  label: string
  href: string
  external?: boolean
}

interface Portrait {
  src: string
  alt?: string
  label: string
}

interface ChatConfig {
  enabled: boolean
  headline?: string
  ctaHref?: string
}

interface ChatMessage {
  role: 'assistant' | 'user'
  content: string
}

interface CredibilitySlideProps {
  headline: string
  body: string
  proofs?: Proof[]
  cta?: { label: string; href: string }
  secondaryCta?: SecondaryCta
  image?: ImageConfig
  portraits?: Portrait[]
  slideshow?: { src: string; alt?: string }[]
  chat?: ChatConfig
  bg?: string
}

const SLIDE_INTERVAL = 4000

/* ── ASCII art Ebner logo – Future font (box-drawing) ── */
const ASCII_LOGO = `
┏━╸┏┓ ┏┓╻┏━╸┏━┓
┣╸ ┣┻┓┃┗┫┣╸ ┣┳┛
┗━╸┗━┛╹ ╹┗━╸╹┗╸
`.trimStart()

function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim())
}

/* ── Typewriter hook ── */
function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    if (!text) return
    let i = 0
    const iv = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        setDone(true)
        clearInterval(iv)
      }
    }, speed)
    return () => clearInterval(iv)
  }, [text, speed])

  return { displayed, done }
}

/* ── Single typewriter message ── */
function TypewriterMessage({ content, onDone }: { content: string; onDone?: () => void }) {
  const { displayed, done } = useTypewriter(content, 15)
  const scrollRef = useRef<(() => void) | null>(null)

  // Get scroll function from parent via data attribute
  useEffect(() => {
    if (done && onDone) onDone()
  }, [done, onDone])

  // Scroll parent on each character
  useEffect(() => {
    scrollRef.current?.()
  }, [displayed])

  return (
    <span className="font-mono text-[15px] leading-relaxed text-white/90 lg:text-base">
      {displayed}
      {!done && <span className="inline-block w-[2px] h-[1em] bg-white/80 ml-[1px] align-middle animate-pulse" />}
    </span>
  )
}

/* ── ASCII logo typewriter hook – types line by line ── */
function useAsciiTypewriter(text: string, isVisible: boolean, charSpeed = 8) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!isVisible || startedRef.current || !text) return
    startedRef.current = true
    let i = 0
    const iv = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        setDone(true)
        clearInterval(iv)
      }
    }, charSpeed)
    return () => clearInterval(iv)
  }, [isVisible, text, charSpeed])

  return { displayed, done }
}

/* ── Inline Chat Widget – Terminal style ── */
function PortraitChat({ ctaHref = '/erstgespraech', isInView = false }: { ctaHref?: string; isInView?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [introComplete, setIntroComplete] = useState(false)

  // ASCII art intro animation
  // Slower animation (12ms per char) and logo stays visible
  const { displayed: asciiDisplayed, done: asciiDone } = useAsciiTypewriter(ASCII_LOGO, isInView, 12)

  // After ASCII art finishes, wait a beat then enable the chat input below the logo
  useEffect(() => {
    if (!asciiDone) return
    const t = setTimeout(() => setIntroComplete(true), 1000)
    return () => clearTimeout(t)
  }, [asciiDone])

  // Scroll to bottom of chat container
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, isTyping, asciiDisplayed, scrollToBottom])

  // Also scroll during typewriter via interval
  useEffect(() => {
    if (!isTyping) return
    const iv = setInterval(scrollToBottom, 80)
    return () => clearInterval(iv)
  }, [isTyping, scrollToBottom])

  const sendMessage = async (userMessage?: string) => {
    const text = userMessage ?? input.trim()
    if (!text && started) return

    const newMessages: ChatMessage[] = started
      ? [...messages, { role: 'user' as const, content: text }]
      : []

    if (started) {
      setMessages(newMessages)
      setInput('')
    } else {
      setStarted(true)
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/ki-readiness-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      if (data.reply) {
        setIsTyping(true)
        const updated = [...newMessages, { role: 'assistant' as const, content: data.reply }]
        setMessages(updated)
        if (data.reply.includes('/10')) setFinished(true)
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Da ist etwas schiefgelaufen. Versuch es gleich nochmal.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (input.trim() && !isTyping) sendMessage()
  }

  const lastAssistantIdx = messages.map((m, i) => m.role === 'assistant' ? i : -1).filter(i => i >= 0).pop() ?? -1

  return (
    <div className="flex h-full w-full flex-col">
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* ASCII art logo – always visible, starts at top */}
        <div className="mb-5">
          <pre className="font-mono text-sm leading-[1.1] text-white/50 lg:text-base">
            {asciiDisplayed}
            {!asciiDone && <span className="inline-block w-[2px] h-[1em] bg-white/80 ml-[1px] align-middle animate-pulse" />}
          </pre>
          {asciiDone && (
            <p className="mt-4 font-mono text-xs tracking-wide text-white/40 lg:text-sm">
              Mach den KI-Readiness-Check hier
              {!introComplete && <span className="ml-1 animate-pulse">_</span>}
            </p>
          )}
        </div>

        {/* Chat content – appears below the logo after intro */}
        {introComplete && (
          <>
            {!started && (
              <p className="mb-4 font-mono text-sm text-white/30 lg:text-base">
                <span className="animate-pulse">▍</span>
              </p>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`mb-4 ${msg.role === 'user' ? '' : ''}`}>
                {msg.role === 'user' ? (
                  <p className="font-mono text-[15px] text-white/50 lg:text-base">
                    <span className="text-white/30">›</span> {msg.content}
                  </p>
                ) : (
                  <div className="mt-1">
                    {i === lastAssistantIdx && isTyping ? (
                      <TypewriterMessage
                        content={msg.content}
                        onDone={() => {
                          setIsTyping(false)
                          setTimeout(() => inputRef.current?.focus(), 100)
                        }}
                      />
                    ) : (
                      <p className="font-mono text-[15px] leading-relaxed text-white/90 lg:text-base">
                        {msg.content}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <p className="font-mono text-[15px] text-white/40 lg:text-base">
                <span className="animate-pulse">▍</span>
              </p>
            )}
          </>
        )}
      </div>

      {/* Input – terminal style with > prompt */}
      {introComplete && !finished ? (
        <form
          onSubmit={handleSubmit}
          className="flex shrink-0 items-center gap-2 border-b border-white/25 py-3"
        >
          <span className="font-mono text-base text-white/40">›</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={started ? 'Deine Antwort…' : 'KI-Readiness-Check starten…'}
            onFocus={() => { if (!started) sendMessage('') }}
            disabled={isLoading || isTyping}
            className="flex-1 bg-transparent font-mono text-base text-white placeholder-white/30 outline-none disabled:opacity-50"
          />
          {started && (
            <button
              type="submit"
              disabled={!input.trim() || isLoading || isTyping}
              className="text-white/30 transition-colors hover:text-white disabled:opacity-20"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </form>
      ) : introComplete && finished ? (
        <div className="shrink-0 pt-4 text-center">
          <a
            href={ctaHref}
            className="inline-block rounded-full bg-white px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-text-primary transition-transform hover:scale-105"
          >
            Ergebnis besprechen
          </a>
        </div>
      ) : null}
    </div>
  )
}

export function CredibilitySlide({
  headline,
  body,
  proofs,
  cta,
  secondaryCta,
  image,
  portraits,
  slideshow,
  chat,
  bg = '#F44900',
}: CredibilitySlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const paragraphs = bodyParagraphs(body)

  /* ── Slideshow auto-advance ── */
  const [activeSlide, setActiveSlide] = useState(0)
  const slideCount = slideshow?.length ?? 0

  const advance = useCallback(() => {
    if (slideCount > 0) setActiveSlide((prev) => (prev + 1) % slideCount)
  }, [slideCount])

  useEffect(() => {
    if (slideCount <= 1 || !isInView) return
    const iv = setInterval(advance, SLIDE_INTERVAL)
    return () => clearInterval(iv)
  }, [slideCount, isInView, advance])

  const hasSlideshow = slideshow && slideshow.length > 0
  const hasPortraits = portraits && portraits.length > 0
  const hasChat = chat?.enabled

  return (
    <section
      ref={ref}
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-2">
        {/* ── Text Column ── */}
        <motion.div
          className={`flex flex-col px-8 lg:px-20 ${
            hasChat
              ? 'justify-start pb-20 pt-[14vh] lg:pb-32 lg:pt-[14vh]'
              : 'justify-center py-20 lg:py-32'
          }`}
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="max-w-[560px] font-display text-[2.5rem] font-normal leading-[1.1] text-white md:text-[3.5rem] lg:text-[4.25rem]">
            {headline}
          </h2>

          <div className="mt-8 max-w-[480px] space-y-4">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="font-body text-lg leading-relaxed text-white/80 lg:text-xl"
              >
                {p}
              </p>
            ))}
          </div>

          {proofs && proofs.length > 0 && (
            <ul className="mt-10 space-y-4">
              {proofs.map((proof, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="text-white"
                    >
                      <path
                        d="M2 6.5L4.5 9L10 3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="font-body text-base text-white lg:text-lg">
                    {proof.text}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* CTAs */}
          {(cta || secondaryCta) && (
            <div className="mt-12 flex flex-wrap items-center gap-4">
              {cta && (
                <a
                  href={cta.href}
                  className="inline-block rounded-full bg-white px-8 py-4 font-mono text-sm font-semibold uppercase tracking-wide text-text-primary transition-transform hover:scale-105"
                >
                  {cta.label}
                </a>
              )}
              {secondaryCta && (
                <a
                  href={secondaryCta.href}
                  target={secondaryCta.external ? '_blank' : undefined}
                  rel={secondaryCta.external ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/60 px-8 py-[14px] font-mono text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  {secondaryCta.label}
                  {secondaryCta.external && (
                    <ExternalLink className="h-4 w-4" strokeWidth={2} />
                  )}
                </a>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Right Column: Portraits with Chat ── */}
        {!hasSlideshow && hasPortraits && (
          <motion.div
            className="relative flex flex-col items-center justify-end lg:justify-end"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
          >
            {/* Chat floating above portraits – terminal style with dark bg */}
            {hasChat && (
              <div
                className="absolute left-[3%] right-[3%] z-20 rounded-xl bg-black/40 px-5 py-4 backdrop-blur-sm"
                style={{ top: '14vh', height: '34%' }}
              >
                <PortraitChat ctaHref={chat?.ctaHref} isInView={isInView} />
              </div>
            )}

            {/* Portrait images */}
            <div className="flex items-end">
              {portraits!.map((portrait, i) => (
                <div key={i} className="relative flex flex-col items-center">
                  {/* Labels only if no chat */}
                  {!hasChat && (
                    <p
                      className="absolute left-1/2 z-10 -translate-x-1/2 text-center font-handwritten text-xl leading-snug text-white lg:text-[1.7rem]"
                      style={{ bottom: '60%', maxWidth: '85%' }}
                    >
                      {portrait.label}
                    </p>
                  )}
                  {/* Portrait image */}
                  <div className="relative h-[60vh] w-[46vw] lg:h-[85vh] lg:w-[22vw]">
                    <ImageWithFallback
                      src={portrait.src}
                      alt={portrait.alt ?? ''}
                      fill
                      className="object-contain object-bottom"
                      sizes="(max-width: 768px) 46vw, 22vw"
                      label={portrait.alt ?? `Portrait ${i + 1}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Right Column: Single Image (non-slideshow, non-portraits) ── */}
        {!hasSlideshow && !hasPortraits && image && (
          <motion.div
            className="relative flex items-center justify-center overflow-hidden lg:items-center lg:justify-end"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
          >
            <div className="relative h-[70vh] w-full lg:h-full">
              <ImageWithFallback
                src={image.src}
                alt={image.alt ?? ''}
                fill
                className="object-contain object-bottom"
                sizes="(max-width: 768px) 80vw, 40vw"
                label="Credibility"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Slideshow: positioned absolute, bleeds to right viewport edge ── */}
      {hasSlideshow && (
        <motion.div
          className="absolute right-0 top-[30%] hidden h-[760px] w-[55%] lg:block"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
        >
          <div className="relative h-full w-full overflow-hidden">
            {slideshow!.map((slide, i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                animate={{ opacity: i === activeSlide ? 1 : 0 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              >
                <ImageWithFallback
                  src={slide.src}
                  alt={slide.alt ?? ''}
                  fill
                  className="object-cover object-left-top"
                  sizes="55vw"
                  label={`Leadtime ${i + 1}`}
                />
              </motion.div>
            ))}

            {slideCount > 1 && (
              <div className="absolute -bottom-10 left-8 z-10 flex gap-2">
                {slideshow!.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeSlide
                        ? 'w-8 bg-white'
                        : 'w-3 bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Mobile slideshow */}
      {hasSlideshow && (
        <div className="relative h-[50vh] w-full lg:hidden">
          {slideshow!.map((slide, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              animate={{ opacity: i === activeSlide ? 1 : 0 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              <ImageWithFallback
                src={slide.src}
                alt={slide.alt ?? ''}
                fill
                className="object-cover object-left-top"
                sizes="100vw"
                label={`Leadtime ${i + 1}`}
              />
            </motion.div>
          ))}
          {slideCount > 1 && (
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {slideshow!.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeSlide
                      ? 'w-8 bg-white'
                      : 'w-3 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
