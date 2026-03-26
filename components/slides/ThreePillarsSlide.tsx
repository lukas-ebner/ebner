'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import { useQuiz } from '@/components/QuizContext'

interface Pillar {
  id: string
  label: string
  sublabel: string
  description: string
  descriptionFallback: string
  longDescription: string
  longDescriptionFallback: string
  icon: string
  color: string
  colorLight: string
  link: string
}

interface ThreePillarsSlideProps {
  headline: string
  headlineFallback?: string
  subtext?: string
  subtextFallback?: string
  pillars?: Pillar[]
}

const DEFAULT_PILLARS: Pillar[] = [
  {
    id: 'operations',
    label: 'Operations & Führung',
    sublabel: 'Das Fundament',
    // After quiz
    description:
      'Erinnerst du dich an die ersten drei Fragen? Urlaub ohne Laptop, klare Rollen, am statt im Unternehmen arbeiten — hier setzen wir an.',
    longDescription:
      'Im Test hast du gesehen, wie stark dein Unternehmen noch an dir hängt. Genau das ändern wir zuerst. Nicht weil Führung unwichtig ist — sondern weil du führen sollst, nicht feuerlöschen.\n\nWir definieren klare Rollen, bauen Entscheidungswege, die ohne dich funktionieren, und dokumentieren das Wissen, das bisher nur in deinem Kopf steckt. Das Ziel: Du fährst zwei Wochen in den Urlaub und nichts brennt. Das klingt simpel — aber genau daran scheitern die meisten.',
    // Without quiz
    descriptionFallback:
      'Dein Unternehmen hängt an dir? Klare Rollen, dokumentierte Prozesse, ein Team das eigenständig entscheidet — hier fangen wir an.',
    longDescriptionFallback:
      'Die meisten Geschäftsführer sind der größte Engpass ihres eigenen Unternehmens. Sie entscheiden alles, sind in jedem Meeting, kennen jeden Kunden persönlich. Das fühlt sich an wie Kontrolle — ist aber das Gegenteil von Skalierung.\n\nWir definieren klare Rollen, bauen Entscheidungswege, die ohne dich funktionieren, und dokumentieren das Wissen, das bisher nur in deinem Kopf steckt. Das Ziel: Du fährst zwei Wochen in den Urlaub und nichts brennt.',
    icon: '◯',
    color: 'rgb(244, 73, 0)',
    colorLight: 'rgba(244, 73, 0, 0.10)',
    link: '/operations',
  },
  {
    id: 'systeme',
    label: 'Systeme & Automatisierung',
    sublabel: 'Die Infrastruktur',
    description:
      'Alles an einem Ort, Echtzeit-Überblick, automatisierte Abläufe — die Fragen 4 bis 6 haben gezeigt, ob eure Systeme mithalten.',
    longDescription:
      'Wenn du im Test bei „Alles an einem Ort" oder „Überblick auf einen Blick" gezögert hast, liegt hier dein größter Hebel. Denn ohne System bleibt jede Prozessverbesserung Theorie.\n\nWir konsolidieren euren Tool-Flickenteppich in ein zentrales System. Projekte, Kapazität, Finanzen, Kunden — alles an einem Ort. Das kann Leadtime sein, mein eigenes Tool, oder etwas anderes. Entscheidend ist: Du triffst Entscheidungen auf Basis von Daten, nicht auf Basis von fünf Rückfragen.',
    descriptionFallback:
      'Ein zentrales System statt 15 Einzeltools. Projekte, Kapazität, Finanzen — auf einen Blick statt auf fünf Rückfragen.',
    longDescriptionFallback:
      'Slack, Trello, Excel, Google Drive, E-Mail — ein Flickenteppich aus Tools, die nicht miteinander sprechen. Du weißt nicht, wo dein Unternehmen gerade steht, ohne fünf Leute zu fragen.\n\nWir konsolidieren euren Tool-Flickenteppich in ein zentrales System. Projekte, Kapazität, Finanzen, Kunden — alles an einem Ort. Das kann Leadtime sein, mein eigenes Tool, oder etwas anderes. Entscheidend ist: Überblick statt Blindflug.',
    icon: '△',
    color: 'rgb(13, 80, 84)',
    colorLight: 'rgba(13, 80, 84, 0.10)',
    link: '/digitalisierung',
  },
  {
    id: 'ki',
    label: 'KI-Readiness & Prototyping',
    sublabel: 'Der Beschleuniger',
    description:
      'KI-Strategie, Team-Enablement, Prototypen in Produktion — die letzten drei Fragen haben gezeigt, wo ihr bei KI wirklich steht.',
    longDescription:
      'Die meisten beantworten die KI-Fragen im Test mit „Noch nicht" oder „Dringend nötig". Das ist kein Vorwurf — es ist der Normalzustand. Aber es ist auch die größte Chance.\n\nWenn Führung und Systeme stehen, wird KI zum Turbo. Wir identifizieren, wo KI bei euch den größten Hebel hat, machen dein Team fit und bauen erste Prototypen. Nicht als IT-Projekt, sondern als Kulturwandel. Damit KI bei euch nicht Buzzword bleibt, sondern Wettbewerbsvorteil wird.',
    descriptionFallback:
      'Jeder redet über KI — die wenigsten setzen sie um. Vom ersten Prototyp bis zur strategischen Verankerung in deinem Unternehmen.',
    longDescriptionFallback:
      'Die wenigsten Unternehmen nutzen KI wirklich. Und noch weniger haben sie so im Unternehmen verankert, dass es einen echten Unterschied macht.\n\nWenn Führung und Systeme stehen, wird KI zum Turbo. Wir identifizieren, wo KI bei euch den größten Hebel hat, machen dein Team fit und bauen erste Prototypen. Nicht als IT-Projekt, sondern als Kulturwandel. Damit KI bei euch nicht Buzzword bleibt, sondern Wettbewerbsvorteil wird.',
    icon: '◇',
    color: 'rgb(27, 21, 100)',
    colorLight: 'rgba(27, 21, 100, 0.10)',
    link: '/ki-readiness',
  },
]

const HEADLINE_FALLBACK = 'Mein Angebot baut auf drei Säulen — weil eine allein nicht reicht.'
const SUBTEXT_FALLBACK = 'Viele Berater optimieren einen Bereich. Ich arbeite an allen drei gleichzeitig. Denn bessere Prozesse ohne System bleiben Theorie. Ein System ohne Führung bleibt ungenutzt. Und KI ohne beides ist nur ein teures Spielzeug.'
const INTRO_QUIZ = 'Die neun Aussagen im Test bilden genau diese drei Bereiche ab. Jeder für sich ist ein Hebel — aber erst zusammen ergeben sie echte unternehmerische Freiheit. Klick auf einen Bereich, um zu sehen, wie wir daran arbeiten.'
const INTRO_FALLBACK = 'Jeder Bereich für sich ist ein Hebel — aber erst zusammen ergeben sie echte unternehmerische Freiheit. Klick auf einen Bereich, um mehr zu erfahren.'

export function ThreePillarsSlide({
  headline,
  headlineFallback,
  subtext,
  subtextFallback,
  pillars = DEFAULT_PILLARS,
}: ThreePillarsSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const { quizCompleted } = useQuiz()
  const [activePillar, setActivePillar] = useState<string | null>(null)
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null)

  const displayHeadline = quizCompleted ? headline : (headlineFallback || HEADLINE_FALLBACK)
  const displaySubtext = quizCompleted ? subtext : (subtextFallback || SUBTEXT_FALLBACK)

  const active = pillars.find((p) => p.id === activePillar)
  const hovered = pillars.find((p) => p.id === hoveredPillar)

  // Circle centers — inverted pyramid: fundament at bottom
  const circlePositions = [
    { cx: 240, cy: 290 }, // Operations (bottom center) — orange
    { cx: 155, cy: 150 }, // Systeme (top left) — teal
    { cx: 325, cy: 150 }, // KI (top right) — indigo
  ]

  return (
    <div ref={ref} className="bg-[#F7F7F5] py-section-mobile lg:py-section-desktop">
      <div className="mx-auto max-w-[1600px] px-8 lg:px-20">
        {/* Headline */}
        <motion.div
          className="mb-8 lg:mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 h-[2px] w-16 bg-brand" />
          <h2 className="max-w-[820px] font-display text-[2rem] font-normal leading-[1.1] text-text-primary md:text-[2.8rem] lg:text-[3.6rem]">
            {displayHeadline}
          </h2>
          {displaySubtext && (
            <p className="mt-6 max-w-[620px] font-body text-lg leading-relaxed text-text-secondary lg:text-xl">
              {displaySubtext}
            </p>
          )}
        </motion.div>

        {/* Content: Text left, Graphic right */}
        <div className="flex flex-col-reverse items-start gap-8 lg:flex-row lg:gap-16">
          {/* ── Text side (left) ── */}
          <div className="flex-1 lg:max-w-[560px]">
            <AnimatePresence mode="wait">
              {active ? (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Back link (top) */}
                  <button
                    onClick={() => setActivePillar(null)}
                    className="mb-6 inline-flex items-center gap-1.5 font-body text-sm text-text-secondary/50 transition-colors hover:text-text-primary"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Übersicht
                  </button>

                  {/* Category label */}
                  <p
                    className="mb-2 font-mono text-xs uppercase tracking-widest"
                    style={{ color: active.color }}
                  >
                    {active.sublabel}
                  </p>

                  {/* Title */}
                  <h3 className="mb-5 font-display text-[1.6rem] font-normal leading-tight text-text-primary lg:text-[2rem]">
                    {active.label}
                  </h3>

                  {/* Long description */}
                  <div className="space-y-4">
                    {(quizCompleted ? active.longDescription : active.longDescriptionFallback).split('\n\n').map((p, i) => (
                      <p
                        key={i}
                        className="font-body text-[1.05rem] leading-relaxed text-text-secondary"
                      >
                        {p}
                      </p>
                    ))}
                  </div>

                  {/* CTA link */}
                  <a
                    href={active.link}
                    className="mt-8 inline-flex items-center gap-2 rounded-full border px-6 py-2.5 font-mono text-sm uppercase tracking-widest transition-all duration-200 hover:shadow-md"
                    style={{
                      borderColor: active.color,
                      color: active.color,
                    }}
                  >
                    Mehr erfahren
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
                      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </motion.div>
              ) : (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="space-y-4"
                >
                  <p className="font-body text-[1.1rem] leading-relaxed text-text-secondary">
                    {quizCompleted ? INTRO_QUIZ : INTRO_FALLBACK}
                  </p>

                  {pillars.map((p, i) => (
                    <motion.button
                      key={p.id}
                      onClick={() => setActivePillar(p.id)}
                      onMouseEnter={() => setHoveredPillar(p.id)}
                      onMouseLeave={() => setHoveredPillar(null)}
                      className="group flex w-full items-start gap-5 rounded-xl p-4 text-left transition-all duration-200 hover:bg-white hover:shadow-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.5 + i * 0.15 }}
                    >
                      <span
                        className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold text-white transition-transform duration-200 group-hover:scale-110"
                        style={{ backgroundColor: p.color }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <span className="font-display text-[1.15rem] text-text-primary transition-colors group-hover:text-brand">
                          {p.label}
                        </span>
                        <p className="mt-1 font-body text-sm leading-relaxed text-text-secondary/70">
                          {quizCompleted ? p.description : p.descriptionFallback}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── SVG graphic (right) ── */}
          <motion.div
            className="relative w-full flex-shrink-0 lg:w-[520px] xl:w-[580px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <svg
              viewBox="0 0 480 420"
              className="mx-auto h-auto w-full max-w-[520px] lg:max-w-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* ── Three overlapping circles ── */}
              {pillars.map((p, i) => {
                const pos = circlePositions[i]
                const isActive = activePillar === p.id
                const isHovered = hoveredPillar === p.id
                const dimmed = (activePillar || hoveredPillar) && !isActive && !isHovered

                return (
                  <motion.circle
                    key={p.id}
                    cx={pos.cx}
                    cy={pos.cy}
                    r="108"
                    fill={isActive || isHovered ? p.colorLight.replace(/[\d.]+\)$/, '0.18)') : p.colorLight}
                    stroke={p.color}
                    strokeWidth={isActive ? 3 : isHovered ? 2 : 1}
                    opacity={dimmed ? 0.25 : 1}
                    className="cursor-pointer transition-all duration-300"
                    onClick={() =>
                      setActivePillar(activePillar === p.id ? null : p.id)
                    }
                    onMouseEnter={() => setHoveredPillar(p.id)}
                    onMouseLeave={() => setHoveredPillar(null)}
                    initial={{
                      cx: pos.cx + (i === 0 ? 0 : i === 1 ? -30 : 30),
                      cy: pos.cy + (i === 0 ? -40 : 40),
                      opacity: 0,
                    }}
                    animate={
                      isInView
                        ? {
                            cx: pos.cx,
                            cy: pos.cy,
                            opacity: dimmed ? 0.25 : 1,
                            scale: isActive ? 1.05 : isHovered ? 1.03 : 1,
                          }
                        : {}
                    }
                    transition={{ duration: 0.7, delay: 0.3 + i * 0.2 }}
                  />
                )
              })}

              {/* ── Labels inside circles (offset away from intersection) ── */}
              {pillars.map((p, i) => {
                // Labels closer to circle centers
                const labelPositions = [
                  { x: 240, y: 318 },   // Operations: slightly below center
                  { x: 138, y: 128 },   // Systeme: slightly above center
                  { x: 342, y: 128 },   // KI: slightly above center
                ]
                const lp = labelPositions[i]
                const dimmed = (activePillar || hoveredPillar) && activePillar !== p.id && hoveredPillar !== p.id

                return (
                  <g
                    key={`label-${p.id}`}
                    className="pointer-events-none"
                    opacity={dimmed ? 0.2 : 1}
                    style={{ transition: 'opacity 0.3s' }}
                  >
                    <text
                      x={lp.x}
                      y={lp.y}
                      textAnchor="middle"
                      className="font-display text-[14px] font-normal"
                      style={{ fill: p.color }}
                    >
                      {p.sublabel}
                    </text>
                    <text
                      x={lp.x}
                      y={lp.y + 18}
                      textAnchor="middle"
                      className="font-body text-[11px]"
                      style={{ fill: p.color, opacity: 0.65 }}
                    >
                      {p.label}
                    </text>
                  </g>
                )
              })}

              {/* ── Center "Freiheit" circle — large, black, overlays everything ── */}
              <motion.g
                initial={{ opacity: 0, scale: 0.6 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="pointer-events-none"
              >
                <circle cx="240" cy="210" r="42" fill="#111" />
                <text
                  x="240"
                  y="214"
                  textAnchor="middle"
                  className="font-display text-[13px] font-bold"
                  style={{ fill: '#fff' }}
                >
                  Freiheit
                </text>
              </motion.g>

              {/* ── Animated pulse rings on active circle ── */}
              {activePillar && (
                <motion.circle
                  cx={circlePositions[pillars.findIndex((p) => p.id === activePillar)]?.cx}
                  cy={circlePositions[pillars.findIndex((p) => p.id === activePillar)]?.cy}
                  r="115"
                  fill="none"
                  stroke={pillars.find((p) => p.id === activePillar)?.color}
                  strokeWidth="1"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.12, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
            </svg>

            {/* ── Hint text below graphic ── */}
            <motion.p
              className="mt-4 text-center font-body text-xs tracking-wide text-text-secondary/40"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 1.5 }}
            >
              Klicke auf die Bereiche, um mehr zu erfahren
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
