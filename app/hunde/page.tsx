'use client'

import { motion } from 'framer-motion'
import {
  Heart,
  PawPrint,
  Bone,
  Shield,
  Sparkles,
  ChevronDown,
} from 'lucide-react'

const breeds = [
  {
    name: 'Golden Retriever',
    origin: 'Schottland',
    trait: 'Freundlich & geduldig',
    emoji: '🦮',
    color: 'from-amber-100 to-amber-200',
  },
  {
    name: 'Deutscher Schäferhund',
    origin: 'Deutschland',
    trait: 'Intelligent & loyal',
    emoji: '🐕‍🦺',
    color: 'from-stone-200 to-stone-300',
  },
  {
    name: 'Labrador',
    origin: 'Kanada',
    trait: 'Verspielt & aktiv',
    emoji: '🐕',
    color: 'from-yellow-100 to-yellow-200',
  },
  {
    name: 'Dackel',
    origin: 'Deutschland',
    trait: 'Mutig & neugierig',
    emoji: '🌭',
    color: 'from-orange-100 to-orange-200',
  },
  {
    name: 'Border Collie',
    origin: 'Großbritannien',
    trait: 'Agil & lernfähig',
    emoji: '🐾',
    color: 'from-sky-100 to-sky-200',
  },
  {
    name: 'Mops',
    origin: 'China',
    trait: 'Verschmust & ruhig',
    emoji: '🐶',
    color: 'from-rose-100 to-rose-200',
  },
]

const facts = [
  {
    stat: '300+',
    label: 'Hunderassen weltweit',
    icon: Sparkles,
  },
  {
    stat: '40×',
    label: 'besserer Geruchssinn als Menschen',
    icon: PawPrint,
  },
  {
    stat: '15 Jahre',
    label: 'durchschnittliche Lebenserwartung',
    icon: Heart,
  },
  {
    stat: '10.000+',
    label: 'Jahre als Begleiter des Menschen',
    icon: Bone,
  },
]

const careTips = [
  {
    title: 'Tägliche Bewegung',
    text: 'Mindestens 30–60 Minuten Spaziergang pro Tag halten Hunde körperlich und geistig fit.',
    icon: PawPrint,
  },
  {
    title: 'Ausgewogene Ernährung',
    text: 'Hochwertiges Futter, frisches Wasser und regelmäßige Fütterungszeiten sind die Basis für Gesundheit.',
    icon: Bone,
  },
  {
    title: 'Sozialisierung',
    text: 'Frühe Kontakte zu Menschen, anderen Hunden und verschiedenen Umgebungen fördern ein selbstsicheres Wesen.',
    icon: Heart,
  },
  {
    title: 'Gesundheitschecks',
    text: 'Jährliche Tierarztbesuche, Impfungen und regelmäßige Parasitenprophylaxe schützen deinen Vierbeiner.',
    icon: Shield,
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

function PawPattern() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="paws" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path
            d="M20 30c-3 0-5-2.5-5-5.5s2-5.5 5-5.5 5 2.5 5 5.5-2 5.5-5 5.5zm15 8c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5zm-30 0c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5zm15 12c-4 0-7-3-7-7s3-7 7-7 7 3 7 7-3 7-7 7z"
            fill="currentColor"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#paws)" />
    </svg>
  )
}

export default function HundePage() {
  return (
    <main className="bg-[#FDF6EC] text-[#2C1810]">
      {/* ── HERO ────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#8B4513] via-[#A0522D] to-[#CD853F] pt-28 text-white lg:pt-32">
        <PawPattern />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-8 lg:px-8 lg:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-200">
              HundeWelt · Dein Guide für Vierbeiner
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] lg:text-[5.5rem]">
              Hunde sind mehr
              <br />
              <span className="text-amber-200">als nur Haustiere</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-amber-100/90">
              Seit Jahrtausenden begleiten Hunde den Menschen – als treue Freunde,
              Schutzengel und Familienmitglieder. Entdecke alles Wissenswerte über
              unsere geliebten Vierbeiner.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#rassen"
                className="rounded-full bg-white px-8 py-3.5 font-medium text-[#8B4513] shadow-lg transition hover:bg-amber-50 hover:shadow-xl"
              >
                Rassen entdecken
              </a>
              <a
                href="#pflege"
                className="rounded-full border-2 border-white/40 px-8 py-3.5 font-medium text-white transition hover:border-white hover:bg-white/10"
              >
                Pflegetipps
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mx-auto mt-16 flex max-w-lg items-center justify-center"
          >
            <div className="relative">
              <div className="text-[8rem] leading-none lg:text-[10rem]">🐕</div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="absolute -right-4 -top-4 text-4xl"
              >
                ❤️
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="mt-12 flex justify-center"
          >
            <ChevronDown className="h-6 w-6 text-amber-200/60" />
          </motion.div>
        </div>
      </section>

      {/* ── FAKTEN ────────────────────────────────────── */}
      <section className="relative -mt-8 px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {facts.map((fact, i) => (
            <motion.div
              key={fact.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeUp}
              className="rounded-2xl bg-white p-6 shadow-md shadow-amber-900/5 lg:p-8"
            >
              <fact.icon className="mb-3 h-5 w-5 text-[#CD853F]" />
              <p className="font-display text-3xl text-[#8B4513] lg:text-4xl">{fact.stat}</p>
              <p className="mt-1 text-sm text-[#6B5344]">{fact.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ÜBER HUNDE ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#CD853F]">
              Warum Hunde besonders sind
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-[#2C1810] lg:text-5xl">
              Treue, Intelligenz & unendliche Liebe
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[#6B5344]">
              Hunde gehören zu den ältesten domestizierten Tieren der Welt. Ihre
              Fähigkeit, menschliche Emotionen zu erkennen und darauf zu reagieren,
              macht sie zu einzigartigen Begleitern. Studien zeigen, dass der Kontakt
              mit Hunden Stress reduziert, die Stimmung hebt und sogar den Blutdruck
              senken kann.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-[#6B5344]">
              Ob als Arbeitshund, Therapiebegleiter oder einfach als bester Freund –
              Hunde bereichern unser Leben auf unzählige Weise.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { emoji: '🎾', title: 'Spielkameraden', desc: 'Immer bereit zum Toben' },
              { emoji: '🛡️', title: 'Beschützer', desc: 'Wachsam und loyal' },
              { emoji: '🤗', title: 'Tröster', desc: 'Spüren unsere Gefühle' },
              { emoji: '🏃', title: 'Motivatoren', desc: 'Bringen uns in Bewegung' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-5 shadow-sm shadow-amber-900/5 transition hover:shadow-md"
              >
                <span className="text-3xl">{item.emoji}</span>
                <h3 className="mt-3 font-display text-lg text-[#2C1810]">{item.title}</h3>
                <p className="mt-1 text-sm text-[#6B5344]">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── RASSEN ────────────────────────────────────── */}
      <section id="rassen" className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#CD853F]">
              Beliebte Rassen
            </p>
            <h2 className="mt-4 font-display text-4xl text-[#2C1810] lg:text-5xl">
              Sechs Hunderassen im Überblick
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#6B5344]">
              Jede Rasse hat ihren eigenen Charakter. Hier ein kleiner Einblick in
              einige der beliebtesten Hunde weltweit.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {breeds.map((breed, i) => (
              <motion.article
                key={breed.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                variants={fadeUp}
                className="group overflow-hidden rounded-2xl border border-amber-100 bg-[#FDF6EC] transition hover:shadow-lg hover:shadow-amber-900/10"
              >
                <div
                  className={`flex h-36 items-center justify-center bg-gradient-to-br ${breed.color}`}
                >
                  <span className="text-6xl transition group-hover:scale-110">{breed.emoji}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl text-[#2C1810]">{breed.name}</h3>
                  <p className="mt-1 text-sm text-[#CD853F]">Herkunft: {breed.origin}</p>
                  <p className="mt-3 text-[#6B5344]">{breed.trait}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── PFLEGE ────────────────────────────────────── */}
      <section id="pflege" className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#CD853F]">
              Gut versorgt
            </p>
            <h2 className="mt-4 font-display text-4xl text-[#2C1810] lg:text-5xl">
              Pflegetipps für ein glückliches Hundeleben
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
            {careTips.map((tip, i) => (
              <motion.div
                key={tip.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                variants={fadeUp}
                className="flex gap-5 rounded-2xl bg-white p-7 shadow-md shadow-amber-900/5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FDF6EC]">
                  <tip.icon className="h-5 w-5 text-[#8B4513]" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-[#2C1810]">{tip.title}</h3>
                  <p className="mt-2 leading-relaxed text-[#6B5344]">{tip.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#8B4513] via-[#A0522D] to-[#CD853F] py-20 text-white lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-5xl">🐾</div>
            <h2 className="mt-6 font-display text-4xl lg:text-5xl">
              Hunde machen die Welt besser
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-amber-100/90">
              Egal ob du bereits einen Hund hast oder dich gerade informierst –
              jeder Tag mit einem Vierbeiner ist ein Geschenk.
            </p>
            <p className="mt-8 font-handwritten text-2xl text-amber-200">
              Wuff! 🐕
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="border-t border-amber-200/40 bg-[#FDF6EC] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-center text-sm text-[#6B5344] sm:flex-row sm:text-left lg:px-8">
          <p>
            <span className="font-display text-lg text-[#8B4513]">HundeWelt</span>
            <span className="mx-2">·</span>
            Mit Liebe für alle Hundefreunde gemacht
          </p>
          <p className="flex items-center gap-1.5">
            <PawPrint className="h-4 w-4 text-[#CD853F]" />
            2026 · Alle Pfoten reserviert
          </p>
        </div>
      </footer>
    </main>
  )
}
