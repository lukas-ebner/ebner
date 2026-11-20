import Image from 'next/image'
import Link from 'next/link'

/** Autorenbox unter Blogartikeln (E-E-A-T): wer schreibt hier und warum ist er kompetent. */
export function AuthorBox() {
  return (
    <aside
      aria-label="Über den Autor"
      className="mt-16 flex flex-col gap-6 rounded-xl border border-black/5 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:p-8"
    >
      <Image
        src="/images/lukas.png"
        alt="Lukas Ebner"
        width={96}
        height={124}
        sizes="96px"
        className="h-24 w-24 shrink-0 rounded-full bg-surface-light object-cover object-top"
      />
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-text-muted">Geschrieben von</p>
        <p className="mt-1 font-display text-xl text-text-primary">Lukas Ebner</p>
        <p className="mt-3 font-body text-base leading-relaxed text-text-dimmed">
          Unternehmensberater in Regensburg und Geschäftsführer der Wachstumscoach GmbH. Er hat die Digitalagentur
          eins+null mitgegründet, auf rund 50 Mitarbeitende aufgebaut und 2022 verkauft. Heute berät er
          Geschäftsführer im Mittelstand zu Operations, Prozessen, Führung, Digitalisierung und KI, BAFA-förderfähig.
        </p>
        <Link
          href="/ueber-mich"
          className="mt-4 inline-block font-display text-sm font-medium text-brand hover:underline"
        >
          Mehr über Lukas →
        </Link>
      </div>
    </aside>
  )
}
