---
title: "Vibe Coding — Was es ist, wie es funktioniert und warum ich damit Software baue"
slug: vibe-coding
description: "Vibe Coding verändert die Softwareentwicklung. Was es ist, wie der Workflow aussieht, und warum ich als Nicht-Entwickler damit produktionsreife Software baue."
keyword: "vibe coding"
nebenkeywords: ["rapid prototyping software", "mvp entwicklung", "ki automatisierung"]
category: ki
status: published
funnel: TOFU
kd: "KD 3"
date: "2025-11-12"
image: "/images/blog/vibe-coding-hero-v2.jpg"
cta:
  text: "Mehr zu KI & Rapid Prototyping"
  url: "/ki-readiness"
---

Ich habe in den letzten zwölf Monaten mehr Software gebaut als in den zehn Jahren davor. Nicht weil ich programmieren gelernt habe. Sondern weil ich aufgehört habe, es zu versuchen. Und das hat nichts mit KI-Gimmicks zu tun — das ist eine neue Art zu denken, wie man [schnell prototypiert](/blog/mvp-entwicklung).

Der Grund hat einen Namen: Vibe Coding.

## Was ist Vibe Coding? Die Definition ohne Buzzword-Bingo

Der Begriff kommt von Andrej Karpathy, Mitgründer von OpenAI. Im Februar 2025 hat er auf X geschrieben, er gebe sich beim Coden mittlerweile komplett den "Vibes" hin — er beschreibe einfach, was er wolle, und die KI schreibe den Code. Ohne dass er den Code im Detail liest oder versteht. Er akzeptiert, iteriert, promptet nach.

Das klingt erstmal verrückt. Aber Karpathy ist kein Anfänger — der Mann hat das KI-Team bei Tesla geleitet. Wenn der sagt, er vergisst dass der Code existiert, dann ist das kein Zeichen von Faulheit. Es ist ein Signal.

Simon Willison, ein bekannter Entwickler, hat eine wichtige Abgrenzung gemacht: Wenn du jede Zeile reviewst, testest und verstehst, ist das kein Vibe Coding — dann nutzt du ein LLM als Tipp-Assistenten. Vibe Coding ist der bewusste Verzicht auf vollständige Kontrolle. Du steuerst über Ergebnisse, nicht über Code-Zeilen.

Und genau da wird es für Leute wie mich interessant. Geschäftsführer, Berater, Produktmenschen — die wissen, was gebaut werden soll, aber nicht wie.

## Wie Vibe Coding in der Praxis funktioniert

Ich beschreibe meinen tatsächlichen Workflow. Keine Theorie, kein Wunschdenken.

Mein Setup: Claude Code im Terminal, manchmal Cursor wenn ich visuell arbeite. Dazu ein klar strukturiertes Projekt mit Konventionen, die die KI kennt. Das ist wichtig — ohne Projektstruktur produziert Vibe Coding Chaos.

Ein typischer Ablauf bei mir sieht so aus: Ich starte morgens mit einer klaren Vorstellung davon, was die Software können soll. Nicht "baue mir eine App", sondern "ich brauche eine Seite, die Blog-Artikel nach Kategorie filtert, mit einem farbigen Hero-Bereich pro Artikel und einem CTA-Block am Ende." Je präziser die Beschreibung, desto besser das Ergebnis.

Die KI generiert den Code. Ich schaue mir das Ergebnis im Browser an. Funktioniert der Filter? Sieht der Hero gut aus? Stimmt der CTA? Wenn nicht, sage ich was fehlt. Nächste Iteration. In der Regel stehen Features nach 20-40 Minuten, für die ein Entwicklerteam früher Tage gebraucht hätte.

Das ist kein Übertreiben. Diese Website hier — lukasebner.de — ist komplett so entstanden. Next.js, TypeScript, Tailwind, Framer Motion Animationen. Ich habe keine einzige Zeile manuell geschrieben. Was ich gemacht habe: Entscheidungen treffen, Feedback geben, Richtung vorgeben.

## Die Tools: Cursor, Claude Code und warum das Tool zweitrangig ist

Cursor, Claude Code, Windsurf, Replit — die Tool-Landschaft wächst schnell. Aber ich sage dir was: Das Tool ist 20% der Gleichung. Die anderen 80% sind du.

Klingt nach Kalenderspruch, meine ich aber ernst. Ich habe Leute gesehen, die Cursor aufmachen, "baue mir eine App" tippen und sich wundern, warum Müll rauskommt. Vibe Coding funktioniert nicht mit vagen Anweisungen. Es funktioniert mit klaren Anforderungen, guter Projektstruktur und der Fähigkeit, Ergebnisse schnell zu bewerten.

Was ich bei mir gelernt habe: Claude Code im Terminal ist mein Hauptwerkzeug. Ich beschreibe Features in natürlicher Sprache, oft mit Kontext aus bestehenden Dateien. "Baue mir eine Komponente wie PillarDetailSlide, aber mit einem animierten Pipeline-Diagramm das vertikal von Idee bis Production fließt." Die KI kennt den Code, kennt die Konventionen, und liefert etwas, das in 90% der Fälle sofort funktioniert. Die restlichen 10% sind Iteration.

Cursor nutze ich, wenn ich visuell arbeiten will — also wenn ich sehen muss, wie sich Änderungen auf das Layout auswirken. Der Composer-Modus dort ist stark für UI-Arbeit.

Aber nochmal: Du könntest das beste Tool der Welt haben — ohne klare Anforderungen baust du schnell den falschen Kram. Nur eben schneller als vorher.

## Für wen eignet sich Vibe Coding — und wo sind die Grenzen?

Ich bin ehrlich: Vibe Coding ist nicht für alles geeignet. Und wer das behauptet, verkauft dir was.

Wo es brilliert: MVPs, Prototypen, interne Tools, Marketing-Websites, Dashboards, Proof-of-Concepts. Alles wo Geschwindigkeit wichtiger ist als Perfektion. Wo du in drei Tagen wissen willst ob eine Idee funktioniert, statt in drei Monaten.

Bei eins+null, meiner alten Agentur, hätten wir für eine Website wie lukasebner.de mindestens 40 Stunden kalkuliert. Allein für Frontend. Mit Vibe Coding stand die in einem Bruchteil davon. Mit Animationen, Blog-System, Quiz-Funktion, allem.

Wo es nicht funktioniert: Banking-Software, medizinische Systeme, alles wo ein Bug Geld oder Leben kostet. Hochregulierte Umgebungen, DSGVO-kritische Datenverarbeitung. Nicht weil die KI schlechten Code schreibt — sondern weil du als Nicht-Entwickler die Qualität nicht beurteilen kannst. Du weißt nicht, ob da eine SQL-Injection-Lücke drin steckt. Du weißt nicht, ob die Authentifizierung sicher ist.

Und genau deshalb braucht Vibe Coding einen zweiten Schritt.

## Mein 2-Phasen-Modell: Vibe Prototype → Production Code

Hier schweigen die meisten Vibe-Coding-Artikel. Der Prototyp funktioniert — aber hält er 10.000 User aus? Ist er sicher? Wartbar?

Mein System dafür läuft mit meinem technischen Partner Stas. Phase eins: Der Prototyp entsteht per Vibe Coding. Schnell, dirty, funktional. Fliegt die Idee? Ergibt das UI Sinn? Stimmt der Workflow? Antworten in Stunden, nicht Wochen.

Phase zwei: Stas nimmt den Prototyp und macht ihn produktionsreif. Er reviewt den Code, fixt Security-Themen, optimiert Performance, schreibt Tests. Er macht aus dem Rohdiamanten ein Produkt.

Ergebnis: Geschwindigkeit von Vibe Coding kombiniert mit der Qualität von Senior Engineering. Kein Entweder-Oder. Kunden bekommen innerhalb von Tagen einen funktionierenden Prototyp, den sie anfassen und testen können. Und innerhalb von Wochen eine produktionsreife Lösung.

Ein massiver Wettbewerbsvorteil. Während andere Agenturen noch Wireframes malen, haben wir schon einen klickbaren Prototyp im Browser.

## Was Vibe Coding für Geschäftsführer und Agenturen bedeutet

Gerade entsteht eine Spaltung. Auf der einen Seite Geschäftsführer und Agenturen, die Vibe Coding als Spielzeug abtun. Auf der anderen Seite die, die damit ihre gesamte Produktentwicklung beschleunigen.

Die Zahlen sprechen eine klare Sprache: Collins Dictionary hat "Vibe Coding" zum Wort des Jahres 2025 gewählt. Das ist kein Nischenthema mehr — das ist Mainstream.

Für Agenturen bedeutet das: Du kannst MVPs radikal günstiger anbieten. Ein funktionierender Prototyp in drei bis fünf Tagen statt in vier Wochen. Das verändert die Angebotskalkulation. Das verändert die Kundenerwartung. Das verändert dein Geschäftsmodell.

Für Geschäftsführer im Mittelstand: Du bist nicht mehr abhängig von einem Entwicklerteam, um eine Idee zu validieren. Du kannst selbst prototypen. Oder du holst dir jemanden der das für dich macht — in Tagen statt Monaten, für einen Bruchteil der Kosten.

Was ich im deutschen Mittelstand sehe: Noch viel Zurückhaltung. Viele warten ab, beobachten, sind skeptisch. Das ist nachvollziehbar — deutsche Unternehmen sind risikoscheu. Aber die Frage ist nicht ob Vibe Coding kommt. Die Frage ist ob du bei den Ersten bist oder bei den Letzten.

## Die ehrliche Risikobewertung

Ich will hier keinen Hype verkaufen. Vibe Coding hat echte Risiken.

Erstens: Du verstehst den Code nicht. Das heißt, du erkennst Fehler erst wenn sie knallen. Bei einem Prototyp ist das okay — der wird eh weggeworfen oder überarbeitet. Bei einer Kundensoftware die in Production läuft? Fahrlässig.

Zweitens: Security. KI-generierter Code hat Schwachstellen wie menschlich geschriebener Code auch. Nur siehst du sie nicht, wenn du den Code nicht lesen kannst. Deshalb ist Phase zwei — der Senior-Review — nicht optional. Das ist Pflicht.

Drittens: Die Versuchung, den Prototyp einfach als Fertigprodukt zu shappen. "Funktioniert ja!" Ja. Bis es nicht mehr funktioniert. Technische Schulden rächen sich. Immer.

Meine Regel: Vibe-coded Prototypen werden entweder professionell überarbeitet oder sie bleiben Prototypen. Es gibt kein Dazwischen.

## So fängst du an: Drei Schritte zum ersten Vibe-Coding-Projekt

Wenn du jetzt denkst "klingt interessant, aber wie starte ich?" — hier mein pragmatischer Einstieg.

Nimm dir eine kleine Idee. Kein Großprojekt. Ein internes Dashboard. Eine Landing Page. Ein simples Tool das dir den Alltag erleichtert. Installier Claude Code oder Cursor. Beschreib was du brauchst — so konkret wie möglich. Nicht "ich brauche ein CRM" sondern "ich brauche eine Seite die mir meine letzten zehn Kundenanfragen in einer Tabelle anzeigt, sortiert nach Datum, mit einem Status-Feld das ich per Klick ändern kann."

Dann iterier. Schau dir das Ergebnis an. Sag was fehlt. Sag was falsch ist. Die KI korrigiert.

Nach zwei, drei Nachmittagen wirst du verstehen, warum Karpathy sagt: Die heißeste neue Programmiersprache ist Englisch.

Und wenn aus dem Prototyp mehr werden soll — dann hol dir einen Senior-Engineer der den Code produktionsreif macht. Das ist kein Zeichen von Schwäche. Das ist ein System.
