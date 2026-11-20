# SEO- und KI-Sichtbarkeits-Monitoring lukasebner.de

Misst monatlich, ob die SEO-Arbeit (Technik, Leistungsseiten, Ratgeber, Off-Page) wirkt.

| Datei | Inhalt |
|---|---|
| `../../scripts/seo-monitor.py` | DataForSEO-Lauf: Ranked Keywords, Google-Position je Begriff (Top 30, Desktop, DE), AI-Overview-Zitat, Backlink-Summary. Kostendeckel 0,50 $/Lauf |
| `../../scripts/seo-keywords.json` | Beobachtete Begriffe (30, aus dem SEO-Konzept), KPI-Begriffe mit `kpi: true` |
| `verlauf.json` | Alle Läufe als JSON (Basis für den Vormonatsvergleich) |
| `berichte/JJJJ-MM-TT.md` | Markdown-Bericht je Lauf |
| `ki-fragen.json` | 10 feste Fragen für die KI-Sichtbarkeit, Bewertung 0–2 je Frage |
| `ki-sichtbarkeit/JJJJ-MM-TT.md` | Ergebnis der KI-Simulation je Lauf |

## Monatlicher Ablauf

1. `python3 scripts/seo-monitor.py --notizen <Notizordner>` (≈ 0,18 $).
2. KI-Simulation: Claude-Subagent mit Websuche beantwortet die Fragen aus `ki-fragen.json` nur aus Suchergebnissen; Auswertung nach `ki-sichtbarkeit/`. Keine bezahlten Modell-Läufe.
3. Search Console (Chrome, Lukas' Konto): Klicks, Impressionen, Ø Position und Anzahl Suchanfragen der letzten 3 Monate, indexierte Seiten notieren.
4. Bericht + Verlauf committen.

## Lesehilfe

- Einzelne SERP-Abfragen schwanken: zwei Läufe am selben Tag lagen für einzelne Begriffe bis zu 10 Plätze auseinander. Trends über mehrere Monate lesen, nicht einzelne Plätze.
- DataForSEO misst nicht personalisiert, Desktop, ganz Deutschland. Die Search Console mittelt über alle echten Suchen und zeigt deshalb oft bessere Positionen (z. B. „lukas ebner“: GSC Ø 3,1, DataForSEO 26).
- „Rankende Keywords“ aus DataForSEO Labs kennt nur Begriffe aus deren Datenbank (12); die Search Console zählt alle Suchanfragen mit Impressionen (202). Für die KPI „12 → 100“ ist die DataForSEO-Zahl gemeint, weil sie vergleichbar bleibt.
- Google-SERPs liefern Treffer teils als verschlüsselte `google.com/goto`-Links; das Skript erkennt lukasebner.de dann über Breadcrumb/Titel.
