'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, ArrowRight } from 'lucide-react'

interface Message {
  role: 'assistant' | 'user'
  content: string
}

interface KiReadinessChatSlideProps {
  headline?: string
  subtext?: string
  bg?: string
  ctaHref?: string
  topic?: string
}

export function KiReadinessChatSlide({
  headline = 'Wie KI-ready bist du?',
  subtext = 'Finde es in 2 Minuten heraus. Unser KI-Assistent stellt dir 5 kurze Fragen – und gibt dir eine ehrliche Einschätzung.',
  bg = '#1B1464',
  ctaHref = '/erstgespraech',
  topic = 'ki-readiness',
}: KiReadinessChatSlideProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (userMessage?: string) => {
    const text = userMessage ?? input.trim()
    if (!text && started) return

    const newMessages: Message[] = started
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
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          topic,
        }),
      })

      const data = await res.json()
      if (data.reply) {
        const updated = [...newMessages, { role: 'assistant' as const, content: data.reply }]
        setMessages(updated)

        // Check if this is the final assessment (contains the score)
        if (data.reply.includes('/10')) {
          setFinished(true)
        }
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Entschuldigung, da ist etwas schiefgelaufen. Versuch es gleich nochmal.',
        },
      ])
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) sendMessage()
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen"
      style={{ backgroundColor: bg }}
    >
      <div className="mx-auto max-w-[1600px] px-8 py-20 lg:px-20 lg:py-32">
        {/* Header */}
        <motion.div
          className="mb-12 max-w-2xl"
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-[2.5rem] font-normal leading-[1.1] text-white md:text-[3.5rem] lg:text-[4.25rem]">
            {headline}
          </h2>
          <p className="mt-6 max-w-lg font-body text-lg leading-relaxed text-white/70 lg:text-xl">
            {subtext}
          </p>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          className="mx-auto max-w-2xl"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {!started ? (
            /* Start Button */
            <button
              onClick={() => sendMessage('')}
              className="group flex items-center gap-4 rounded-2xl border-2 border-white/20 bg-white/5 px-8 py-6 transition-all hover:border-white/40 hover:bg-white/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-display text-xl text-white">KI-Readiness-Check starten</p>
                <p className="mt-1 font-body text-sm text-white/60">5 Fragen · 2 Minuten · kostenlos</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white/80" />
            </button>
          ) : (
            /* Chat Interface */
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              {/* Messages */}
              <div className="max-h-[50vh] min-h-[300px] overflow-y-auto p-6 lg:max-h-[55vh]">
                <AnimatePresence mode="popLayout">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`mb-4 flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          msg.role === 'assistant' ? 'bg-white/20' : 'bg-white/10'
                        }`}
                      >
                        {msg.role === 'assistant' ? (
                          <Bot className="h-4 w-4 text-white" />
                        ) : (
                          <User className="h-4 w-4 text-white/70" />
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === 'assistant'
                            ? 'bg-white/10 text-white'
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        <p className="whitespace-pre-wrap font-body text-[15px] leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4 flex gap-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="rounded-2xl bg-white/10 px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/50" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/50" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/50" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {!finished ? (
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-3 border-t border-white/10 p-4"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Deine Antwort…"
                    disabled={isLoading}
                    className="flex-1 bg-transparent font-body text-[15px] text-white placeholder-white/40 outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30 disabled:opacity-30"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </button>
                </form>
              ) : (
                /* CTA after completion */
                <div className="border-t border-white/10 p-6 text-center">
                  <a
                    href={ctaHref}
                    className="inline-block rounded-full bg-white px-8 py-4 font-mono text-sm font-semibold uppercase tracking-wide text-text-primary transition-transform hover:scale-105"
                  >
                    Ergebnis besprechen – kostenlos
                  </a>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
