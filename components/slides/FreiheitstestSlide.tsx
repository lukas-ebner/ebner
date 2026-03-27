'use client'

import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronRight, ArrowRight, Check, Mail } from 'lucide-react'
import { useQuiz } from '@/components/QuizContext'

/* ─── Farben ──────────────────────────────────────────────────── */
const BG = '#1B2A4A'

/* ─── Quiz-Daten ──────────────────────────────────────────────── */

const SCALE_LABELS = ['Läuft bei uns', 'Teilweise', 'Noch nicht', 'Dringend nötig']

interface Question {
  id: number
  statement: string
  description: string
  image: string
  pillar: 'operations' | 'systeme' | 'ki'
}

const QUESTIONS: Question[] = [
  /* ── Operations & Führung ─────────────────────────────── */
  {
    id: 1,
    statement: 'Dein Unternehmen läuft ohne dich.',
    description: 'Du fährst zwei Wochen in den Urlaub – ohne Laptop, ohne Slack, ohne „kurz mal reinschauen". Wenn du zurückkommst, hat sich nichts aufgestaut. Entscheidungen wurden getroffen, Probleme gelöst, Kunden betreut. Nicht weil es dir egal ist, sondern weil dein Team die Verantwortung trägt und tragen kann.',
    image: '/images/paintings/Leadtime_A_very_busy_octopus_in_a_suit_in_an_office_chair_giv_4793f4a4-7473-40fe-a82d-77769f8a3a99_2.png',
    pillar: 'operations',
  },
  {
    id: 2,
    statement: 'Jede Rolle ist ersetzbar – auch deine.',
    description: 'Wenn morgen dein bester Mitarbeiter kündigt, bricht nichts zusammen. Nicht weil er egal wäre – sondern weil sein Wissen dokumentiert ist, seine Rolle klar definiert und sein Nachfolger in Wochen statt Monaten arbeitsfähig. Dein Unternehmen ist um Rollen gebaut, nicht um Köpfe.',
    image: '/images/paintings/Leadtime_impressionist_oil_painting_a_molten_clock_salvador_d_01158ab5-0d62-4a4f-81c7-27443fee6c3d_3.png',
    pillar: 'operations',
  },
  {
    id: 3,
    statement: 'Du arbeitest am Unternehmen, nicht im Unternehmen.',
    description: 'Dein Kalender ist nicht voll mit Feuerwehr-Terminen und Mikromanagement. Stattdessen hast du Blöcke für Strategie, Produkt und Wachstum. Die operativen Prozesse sind so aufgesetzt, dass das Tagesgeschäft dich nicht mehr braucht – und du dich endlich den Dingen widmen kannst, für die du eigentlich angetreten bist.',
    image: '/images/paintings/Leadtime_impressionist_oil_painting_a_plane_flying_in_a_foggy_b478be71-b748-4732-bd4e-170d85dd04b8_0.png',
    pillar: 'operations',
  },
  /* ── Systeme & Automatisierung ────────────────────────── */
  {
    id: 4,
    statement: 'Alles an einem Ort, nichts im Kopf.',
    description: 'Euer Wissen steckt nicht in E-Mails, Excel-Listen und den Köpfen einzelner Leute. Ihr habt ein zentrales System – für Projekte, Dokumente, Kunden, Prozesse. Jeder findet, was er braucht, ohne jemanden fragen zu müssen. Neue Mitarbeiter können sich selbst onboarden, weil alles dokumentiert und zugänglich ist.',
    image: '/images/paintings/Leadtime_A_huge_warehouse_filled_with_documents_and_file_fold_4d49df4b-98bf-4a1f-acd9-726193e2c169_3.png',
    pillar: 'systeme',
  },
  {
    id: 5,
    statement: 'Du siehst auf einen Blick, wo dein Unternehmen steht.',
    description: 'Umsatz, Pipeline, Auslastung, Projektfortschritt – du musst niemanden anrufen, um zu wissen, wie es läuft. Du hast ein Dashboard, das dir in Echtzeit zeigt, wo ihr steht. Keine Überraschungen im Dezember. Keine Bauchgefühl-Entscheidungen. Daten statt Drama.',
    image: '/images/paintings/Leadtime_impressionist_oil_painting_a_plane_hidden_in_night_a_f88954e9-7b11-4cb0-85ef-5e62273e5052_2.png',
    pillar: 'systeme',
  },
  {
    id: 6,
    statement: 'Wiederkehrende Abläufe laufen automatisch.',
    description: 'Angebote, Rechnungen, Onboarding, Reportings, Follow-ups – alles, was sich wiederholt, ist automatisiert oder standardisiert. Dein Team verschwendet keine Zeit mit Copy-Paste und manuellem Nachfassen. Die Maschine arbeitet, die Menschen denken.',
    image: '/images/paintings/Leadtime_impressionist_oil_painting_Cars_are_stuck_in_traffic_5135203e-b55a-4157-b056-67e48a47b7d9_0.png',
    pillar: 'systeme',
  },
  /* ── KI-Readiness & Prototyping ───────────────────────── */
  {
    id: 7,
    statement: 'Dein Unternehmen hat eine KI-Strategie.',
    description: 'Ihr wisst nicht nur, dass KI wichtig ist – ihr wisst, wo sie bei euch konkret Wert schafft. Ihr habt die Use Cases identifiziert, die euren Alltag verändern: im Support, im Vertrieb, in der Produktion, im Marketing. Kein Hype, kein Aktionismus – ein klarer Plan, welche Prozesse ihr mit KI hebelt und welche nicht.',
    image: '/images/paintings/Leadtime_impressionist_oil_painting_A_country_road._A_small_f_6c9f0104-065b-4d67-b500-13bfffff5644_1.png',
    pillar: 'ki',
  },
  {
    id: 8,
    statement: 'Dein Team nutzt KI im Arbeitsalltag.',
    description: 'KI ist bei euch kein Experiment einzelner Nerds, sondern fester Bestandteil der täglichen Arbeit. Eure Leute nutzen KI-Tools für Recherche, Texte, Analysen, Code, Kundenkommunikation – nicht weil sie müssen, sondern weil es ihre Arbeit besser und schneller macht. Ihr habt Workflows gebaut, die KI nahtlos integrieren.',
    image: '/images/paintings/Leadtime_impressionist_oil_painting_an_unripe_fruit_soft_ligh_824bdcb8-63a1-44b5-afda-9c7e0fabce73_0.png',
    pillar: 'ki',
  },
  {
    id: 9,
    statement: 'KI verschafft dir einen echten Wettbewerbsvorteil.',
    description: 'Während deine Konkurrenz noch darüber redet, was man mit KI alles „könnte", habt ihr bereits Prototypen in Produktion. Ihr reagiert schneller, liefert besser, skaliert effizienter. Eure KI-Readiness ist kein Nice-to-have – sie ist der Grund, warum ihr gewinnt.',
    image: '/images/paintings/Leadtime_abstract_impressionist_oil_painting_a_steam_train_ac_4d78e5b6-548d-475e-be91-d4c9465be583_0.png',
    pillar: 'ki',
  },
]

const PILLAR_LABELS: Record<string, string> = {
  operations: 'Operations & Führung',
  systeme: 'Systeme & Automatisierung',
  ki: 'KI-Readiness & Prototyping',
}

const PILLAR_URLS: Record<string, string> = {
  operations: '/leistungen/operations-und-fuehrung',
  systeme: '/leistungen/systeme-und-automatisierung',
  ki: '/leistungen/ki-readiness',
}

/* ─── Ergebnis-Logik ──────────────────────────────────────────── */

function getResults(answers: Record<number, number>) {
  const pillarTotals: Record<string, { sum: number; max: number }> = {
    operations: { sum: 0, max: 0 },
    systeme: { sum: 0, max: 0 },
    ki: { sum: 0, max: 0 },
  }

  QUESTIONS.forEach((q) => {
    const val = answers[q.id] ?? 0
    pillarTotals[q.pillar].sum += val
    pillarTotals[q.pillar].max += 3
  })

  const totalSum = Object.values(pillarTotals).reduce((a, b) => a + b.sum, 0)
  const totalMax = Object.values(pillarTotals).reduce((a, b) => a + b.max, 0)
  const rawNeed = totalSum / totalMax

  // Freiheitsgrad = INVERTIERT: viel Bedarf → wenig Freiheit
  // Aggressivere Kurve damit Werte dramatischer ausfallen
  const needScore = Math.pow(rawNeed, 0.6)
  const score = Math.round((1 - needScore) * 100)

  // Pfeiler sortiert nach Bedarf (höchster Bedarf zuerst)
  const pillarRanking = Object.entries(pillarTotals)
    .map(([key, v]) => ({
      key,
      pct: Math.round(Math.pow(v.sum / v.max, 0.6) * 100),
    }))
    .sort((a, b) => b.pct - a.pct)

  // Nur Pfeiler mit echtem Bedarf zeigen (>30%)
  const topPillars = pillarRanking.filter((p) => p.pct > 30)

  // Kürzere Pillar-Labels für Fließtext (ohne die &-Orgien)
  const PILLAR_SHORT: Record<string, string> = {
    operations: 'Operations',
    systeme: 'Systeme',
    ki: 'KI',
  }

  const pillarDescriptions: Record<string, string> = {
    operations: 'dein Unternehmen hängt noch zu sehr an dir persönlich',
    systeme: 'eure Systeme und Prozesse bremsen euch aus',
    ki: 'beim Thema KI gibt es ungenutztes Potenzial',
  }

  const topShort = topPillars.map((p) => PILLAR_SHORT[p.key])
  const topDescs = topPillars.slice(0, 2).map((p) => pillarDescriptions[p.key])

  let headline = ''
  let text = ''

  // Score ist jetzt Freiheitsgrad: niedrig = wenig frei
  if (score <= 25) {
    headline = `Dein unternehmerischer Freiheitsgrad ist niedrig – vor allem ${topShort.slice(0, 2).join(' und ')} binden dich.`
    text = `${topDescs[0].charAt(0).toUpperCase() + topDescs[0].slice(1)}${topDescs[1] ? ', und ' + topDescs[1] : ''}. Das ist kein Vorwurf – fast jeder Gründer kennt das. Aber es gibt einen klaren Weg raus.`
  } else if (score <= 50) {
    headline = topPillars.length > 1
      ? `Dein unternehmerischer Freiheitsgrad ist ausbaufähig – ${topShort[0]} und ${topShort[1] ?? ''} kosten dich Freiheit.`
      : `Dein unternehmerischer Freiheitsgrad ist ausbaufähig – ${topShort[0] ?? 'ein Bereich'} kostet dich Freiheit.`
    text = 'Einiges läuft, anderes bremst dich. Genau jetzt ist der richtige Moment, die Weichen zu stellen – bevor aus kleinen Reibungen große Bremsen werden.'
  } else if (score <= 70) {
    headline = topPillars.length > 0
      ? `Dein unternehmerischer Freiheitsgrad ist solide – beim Thema ${topShort[0]} gibt es noch Potenzial.`
      : 'Dein unternehmerischer Freiheitsgrad ist solide – mit Feinschliff-Potenzial.'
    text = 'Vieles funktioniert bei dir schon gut. Aber auch bei einem guten Setup gibt es Hebel für mehr Freiheit.'
  } else {
    headline = 'Dein unternehmerischer Freiheitsgrad ist stark.'
    text = 'Dein Unternehmen klingt, als wärst du schon ziemlich frei. Entweder hast du vieles richtig gemacht – oder wir müssen mal genauer hinschauen.'
  }

  return { score, headline, text, topPillars, pillarRanking }
}

/* ─── Animierter Counter ──────────────────────────────────────── */

function AnimatedCounter({ target }: { target: number }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    let frame: number
    const duration = 2000
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(eased * target))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target])

  return <span className="tabular-nums">{current}%</span>
}

/* ─── Slider-Komponente ───────────────────────────────────────── */

function ScaleSlider({
  value,
  onChange,
}: {
  value: number | null
  onChange: (v: number) => void
}) {
  return (
    <div className="flex w-full gap-3">
      {SCALE_LABELS.map((label, i) => {
        const isSelected = value === i
        return (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`flex-1 rounded-xl py-4 text-center text-base font-medium transition-all ${
              isSelected
                ? 'bg-brand text-white shadow-lg shadow-brand/20'
                : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.12] hover:text-white/80'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

/* ─── Hauptkomponente ─────────────────────────────────────────── */

interface FreiheitstestSlideProps {
  headline?: string
  buttonText?: string
}

export function FreiheitstestSlide({
  buttonText = 'Finde heraus, wo du stehst',
}: FreiheitstestSlideProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const { setQuizCompleted } = useQuiz()
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'calculating' | 'result'>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
  const [result, setResult] = useState<ReturnType<typeof getResults> | null>(null)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const question = QUESTIONS[currentQ]
  const currentAnswer = answers[question?.id] ?? null
  const progress = Object.keys(answers).length / QUESTIONS.length

  const handleAnswer = useCallback(
    (value: number) => {
      const newAnswers = { ...answers, [question.id]: value }
      setAnswers(newAnswers)

      // Auto-advance nach kurzem Delay für visuelles Feedback
      setTimeout(() => {
        if (currentQ < QUESTIONS.length - 1) {
          setDirection(1)
          setCurrentQ((prev) => prev + 1)
        } else {
          // Letzte Frage → Auswerten
          const r = getResults(newAnswers)
          setResult(r)
          setQuizCompleted(true)
          setPhase('calculating')
          setTimeout(() => setPhase('result'), 2800)
        }
      }, 400)
    },
    [question, currentQ, answers, setQuizCompleted],
  )

  const handleBack = useCallback(() => {
    if (currentQ > 0) {
      setDirection(-1)
      setCurrentQ((prev) => prev - 1)
    }
  }, [currentQ])

  const [emailLoading, setEmailLoading] = useState(false)

  const handleEmailSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!email.trim() || emailLoading) return

      setEmailLoading(true)
      try {
        // Build pillar_scores from pillarRanking array
        const pillarScores: Record<string, number> = { operations: 0, systeme: 0, ki: 0 }
        for (const p of result?.pillarRanking ?? []) {
          pillarScores[p.key] = p.pct
        }

        // Map answers from {questionId: scoreValue} to pipeline format
        const pillarPrefixes: Record<string, string> = { operations: 'ops', systeme: 'sys', ki: 'ki' }
        const pillarCounters: Record<string, number> = { ops: 0, sys: 0, ki: 0 }
        const mappedAnswers: Record<string, { q: string; a: number; label: string }> = {}
        for (const q of QUESTIONS) {
          const val = answers[q.id]
          if (val === undefined) continue
          const prefix = pillarPrefixes[q.pillar]
          pillarCounters[prefix] = (pillarCounters[prefix] || 0) + 1
          const key = `${prefix}_${pillarCounters[prefix]}`
          mappedAnswers[key] = {
            q: q.statement,
            a: val,
            label: SCALE_LABELS[val] || '',
          }
        }

        const res = await fetch('/api/strategy-paper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            quiz: {
              score: result?.score ?? 0,
              answers: mappedAnswers,
              pillar_scores: pillarScores,
              top_pillars: (result?.topPillars ?? []).map((p) => p.key),
            },
          }),
        })

        if (!res.ok) {
          console.error('Strategy paper request failed:', res.status)
        }
      } catch (err) {
        console.error('Strategy paper request error:', err)
      }

      setEmailSent(true)
      setEmailLoading(false)
    },
    [email, emailLoading, answers, result],
  )

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  }

  return (
    <div ref={ref} className="relative overflow-hidden" style={{ background: `linear-gradient(to bottom, #243456, ${BG}, #111E38)` }}>
      <AnimatePresence mode="wait">
        {/* ── INTRO ────────────────────────────────────── */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="flex min-h-screen flex-col px-6"
            exit={{ opacity: 0, y: -30, transition: { duration: 0.4 } }}
          >
            {/* Text + Button – centered on mobile, pushed lower on desktop */}
            <div className="flex flex-1 flex-col items-center justify-center pb-4 md:justify-end md:pb-8">
              {/* Zeile 1 */}
              <motion.span
                className="block whitespace-nowrap text-center font-display text-[2.2rem] font-normal leading-[1.1] text-white sm:text-[3rem] md:text-[4rem] lg:text-[5rem]"
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                Du hast gegründet, um frei zu&nbsp;sein.
              </motion.span>

              {/* Zeile 2 */}
              <motion.span
                className="mt-2 block whitespace-nowrap text-center font-display text-[2.2rem] font-normal leading-[1.1] text-white/60 sm:text-[3rem] md:text-[4rem] lg:text-[5rem]"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
              >
                Und? Fühlst du dich&nbsp;frei?
              </motion.span>

              {/* Subtext */}
              <motion.p
                className="mx-auto mt-8 max-w-lg text-center text-xl text-white/40 md:text-2xl"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                9 Aussagen. 2 Minuten. Ein ehrliches Bild.
              </motion.p>

              {/* Button */}
              <motion.button
                onClick={() => setPhase('quiz')}
                className="mt-10 flex items-center gap-2 rounded-full bg-brand px-8 py-4 font-display text-lg font-medium text-white transition-transform hover:scale-105"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 1.3, ease: 'easeOut' }}
              >
                {buttonText}
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Lukas Image – centered, flush to bottom edge */}
            <motion.div
              className="flex shrink-0 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 0.35, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 1.6, ease: 'easeOut' }}
            >
              <Image
                src="/images/lukas-question.png"
                alt="Lukas Ebner"
                width={500}
                height={600}
                className="w-[340px] object-contain md:w-[400px] lg:w-[480px]"
                priority={false}
              />
            </motion.div>
          </motion.div>
        )}

        {/* ── QUIZ ─────────────────────────────────────── */}
        {phase === 'quiz' && question && (
          <motion.div
            key="quiz"
            className="relative flex min-h-screen flex-col px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* ── Oberer Bereich: Bild + Progress + Text ── */}
            <div className="flex flex-1 flex-col items-center justify-center pt-8 pb-4">
              <div className="w-full max-w-2xl flex flex-col items-center">

                {/* Animierter Content (Bild + Text) */}
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={question.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="flex w-full flex-col items-center"
                  >
                    {/* 16:9 Image */}
                    <div className="relative mb-5 w-full overflow-hidden border-2 border-white/10" style={{ aspectRatio: '16/9' }}>
                      <Image
                        src={question.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 672px, (min-width: 768px) 576px, 100vw"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Progress Bar – bleibt stehen beim Fragenwechsel */}
                <div className="mb-6 mt-4 flex w-full items-center gap-3">
                  <button
                    onClick={handleBack}
                    className={`shrink-0 text-xs text-white/40 transition-colors hover:text-white/60 ${
                      currentQ === 0 ? 'invisible' : ''
                    }`}
                  >
                    ←
                  </button>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full bg-brand/70"
                      initial={false}
                      animate={{ width: `${((currentQ + (currentAnswer !== null ? 1 : 0)) / QUESTIONS.length) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-white/30">
                    {currentQ + 1}/{QUESTIONS.length}
                  </span>
                </div>

                {/* Statement + Beschreibung – auch animiert */}
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={`text-${question.id}`}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="flex flex-col items-center"
                  >
                    {/* Statement – feste Höhe reserviert */}
                    <div className="flex h-[5.5rem] items-center justify-center md:h-[6rem] lg:h-[7rem]">
                      <h3 className="text-center font-display text-[1.6rem] font-normal leading-tight text-white md:text-[2rem] lg:text-[2.4rem]">
                        {question.statement}
                      </h3>
                    </div>

                    {/* Beschreibung */}
                    <p className="mt-2 w-full text-center text-base leading-relaxed text-white/40 md:text-lg">
                      {question.description}
                    </p>
                  </motion.div>
                </AnimatePresence>

              </div>
            </div>

            {/* ── Unterer Bereich: Scale Buttons ── */}
            <div className="w-full max-w-2xl mx-auto pb-28 pt-2">
              <ScaleSlider value={currentAnswer} onChange={handleAnswer} />
            </div>
          </motion.div>
        )}

        {/* ── CALCULATING ─────────────────────────────── */}
        {phase === 'calculating' && result && (
          <motion.div
            key="calculating"
            className="flex min-h-screen flex-col items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <p className="mb-6 font-display text-xl text-white/40">Dein unternehmerischer Freiheitsgrad</p>
            <div className="font-display text-[8rem] font-normal leading-none text-white md:text-[12rem]">
              <AnimatedCounter target={result.score} />
            </div>
            <p className="mt-4 text-white/30">von 100%</p>
          </motion.div>
        )}

        {/* ── RESULT ──────────────────────────────────── */}
        {phase === 'result' && result && (
          <motion.div
            key="result"
            className="flex min-h-screen flex-col items-center justify-center px-6 py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Score */}
            <div className="mb-6 font-display text-[5rem] font-normal leading-none text-white md:text-[7rem]">
              {result.score}%
            </div>

            {/* Headline + Text */}
            <motion.h3
              className="mb-4 max-w-2xl text-center font-display text-[1.4rem] font-normal leading-tight text-white md:text-[1.8rem]"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {result.headline}
            </motion.h3>
            <motion.p
              className="mx-auto mb-8 max-w-lg text-center text-base leading-relaxed text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {result.text}
            </motion.p>

            {/* Empfohlene Bereiche – ohne Prozente, nur >30% */}
            {result.topPillars.length > 0 && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <p className="mb-3 text-center text-sm text-white/30">Deine Themen:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {result.topPillars.map((p) => (
                    <a
                      key={p.key}
                      href={PILLAR_URLS[p.key]}
                      className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.1] hover:text-white"
                    >
                      {PILLAR_LABELS[p.key]} →
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Strategie-Paper CTA – weiße, prominente Card */}
            <motion.div
              className="w-full max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              {!emailSent ? (
                <div className="overflow-hidden bg-white shadow-2xl shadow-black/20">
                  <div className="flex flex-col md:flex-row">
                    {/* Ebook-Vorschau */}
                    <div className="relative hidden md:block md:w-2/5">
                      <Image
                        src="/images/ebook/ebook-desk.jpg"
                        alt="Dein persönliches Strategie-Paper"
                        fill
                        className="object-cover object-[center_75%]"
                      />
                    </div>

                    {/* Text + Form */}
                    <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
                      <h4 className="mb-1 font-display text-xl font-medium text-gray-900">
                        Dein persönliches Strategie-Paper
                      </h4>
                      <p className="mb-1 text-sm font-medium text-brand">
                        Kostenlos – individuell auf deine Antworten zugeschnitten
                      </p>
                      <p className="mb-5 text-sm leading-relaxed text-gray-500">
                        Wir analysieren dein Profil, schauen uns deine Website an und erstellen eine konkrete Empfehlung mit den wichtigsten Hebeln für dein Unternehmen.
                      </p>
                      <form onSubmit={handleEmailSubmit} className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@firma.de"
                          required
                          className="flex-1 border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/20"
                        />
                        <button
                          type="submit"
                          disabled={emailLoading}
                          className="flex items-center gap-1.5 bg-brand px-6 py-3 text-sm font-medium text-white shadow-md shadow-brand/20 transition-transform hover:scale-105 disabled:opacity-60"
                        >
                          {emailLoading ? 'Wird erstellt…' : 'Anfordern'}
                          {!emailLoading && <ArrowRight className="h-3.5 w-3.5" />}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div
                  className="bg-white p-10 text-center shadow-2xl shadow-black/20"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Check className="mx-auto mb-3 h-10 w-10 text-brand" />
                  <p className="font-display text-xl font-medium text-gray-900">Ist unterwegs!</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Dein persönliches Strategie-Paper kommt in Kürze per Mail.
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Alternativer CTA */}
            <motion.div
              className="mt-8 flex flex-col items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              <a
                href="/erstgespraech"
                className="text-sm text-white/50 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Oder direkt ein Erstgespräch vereinbaren →
              </a>
              <button
                onClick={() => {
                  setPhase('intro')
                  setCurrentQ(0)
                  setAnswers({})
                  setResult(null)
                  setEmail('')
                  setEmailSent(false)
                }}
                className="mt-2 text-sm text-white/40 underline-offset-4 hover:text-white/60 hover:underline"
              >
                Test wiederholen
              </button>
            </motion.div>

            {/* Scroll-Indikator */}
            <motion.div
              className="mt-32"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <motion.div
                className="flex flex-col items-center gap-1"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-sm text-white/40">Mehr erfahren</span>
                <ChevronRight className="h-5 w-5 rotate-90 text-white/40" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
