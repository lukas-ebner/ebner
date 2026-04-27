# Google Ads Conversion-Setup — 5-Min-Anleitung

> **Status:** GTM-Side ist live (Version 3 published 27.04.2026, 18:00).
> 4 GA4-Event-Tags + 4 Custom-Event-Trigger laufen auf lukasebner.de.
> **Was noch fehlt:** 3 neue Conversion-Actions in Google Ads.

## Bevor du loslegst

Du brauchst Zugang zu dem **richtigen Google-Ads-Konto** — das, in dem auch
die bestehende Erstgespraech-Conversion liegt (Conversion-ID `17857016257`).
Login mit `lukas@getleadtime.de`, ocid 7924826545.

URL: <https://ads.google.com/aw/conversions?ocid=7924826545&authuser=2>

**Verifikation:** In der Conversion-Liste muss die Erstgespraech-Conversion mit
ID `17857016257` auftauchen. Falls nicht → wir sind im falschen Konto. Stop, melden.

## Conversion 1 — DOI Confirmed (PRIMÄR)

Klick **"+ Neue Conversion-Aktion"** → **"Website"** → URL `https://lukasebner.de/unverzichtbar/danke` → "Scannen"
→ Falls Tag-Vorschlag kommt: **"Eigene Conversion-Aktionen mit Code hinzufügen"** wählen.

| Feld | Wert |
|---|---|
| Zielvorhaben | **Lead** (Lead-Kategorie: "Senden eines Lead-Formulars") |
| Conversion-Name | `Unverzichtbar — DOI Confirmed` |
| Wert | "Verwenden Sie für jede Conversion den gleichen Wert" → **20 €** |
| Zählung | **Eine** (eindeutige Conversions) |
| Conversion-Window | 30 Tage (Default OK) |
| Enhanced Conversions | Aktivieren falls vorgeschlagen |
| In "Conversions"-Spalte einbeziehen | **Ja** (Smart Bidding lernt darauf) |

**Speichern und fortfahren** → auf der Code-Seite **Conversion-ID + Conversion-Label kopieren**.

## Conversion 2 — Cost of Chaos Ebook

Wieder **"+ Neue Conversion-Aktion"** → **"Website"** → URL `https://lukasebner.de`
(es gibt keine eigene Danke-Seite — Tracking läuft über `form_submit_ebook` Event).
→ "Eigene Conversion-Aktionen mit Code hinzufügen".

| Feld | Wert |
|---|---|
| Zielvorhaben | **Lead** |
| Conversion-Name | `Cost of Chaos Ebook` |
| Wert | **10 €** (geringere Lead-Qualität, kein DOI) |
| Zählung | **Eine** |
| In "Conversions"-Spalte einbeziehen | **Ja** |

**ID + Label kopieren.**

## Conversion 3 — Form Started Unverzichtbar (Mikro)

**"+ Neue Conversion-Aktion"** → **"Website"** → URL `https://lukasebner.de/unverzichtbar`.
→ "Eigene Conversion-Aktionen mit Code hinzufügen".

| Feld | Wert |
|---|---|
| Zielvorhaben | **Andere** (oder Page View — keine Lead-Qualifizierung) |
| Conversion-Name | `Unverzichtbar — Form Started` |
| Wert | **0 €** oder leer |
| Zählung | **Eine** |
| In "Conversions"-Spalte einbeziehen | **NEIN** ⚠️ — sonst lernt Smart Bidding auf den schwachen Lead |

Diese Conversion ist nur als **Audience-Signal** für Remarketing nützlich.

**ID + Label kopieren.**

---

## Was du mir am Ende schickst

```
DOI Confirmed:  17857016257 / xxxxxxxxxxxxx
Ebook:          17857016257 / xxxxxxxxxxxxx
Form Started:   17857016257 / xxxxxxxxxxxxx
```

Conversion-ID ist bei allen 3 gleich (kontogebunden). Nur die Labels unterscheiden sich.

## Was ich danach mache

1. 3× Google-Ads-Conversion-Tag in GTM anlegen (Tag-Typ: Google Ads-Conversion-Tracking)
2. Pro Tag: ID + Label eintragen, Trigger zuweisen:
   - `CE - DOI Confirmed Unverzichtbar` → DOI-Tag
   - `CE - Form Submit Ebook` → Ebook-Tag
   - `CE - Form Submit Unverzichtbar` → Form-Started-Tag
3. GTM Version 4 publishen
4. End-to-End-Test: `?gclid=test123&utm_source=google&utm_medium=cpc&utm_campaign=test` durch alle 4 Funnel klicken
5. Verifikation: GA4 Realtime + Google Ads Conversion-Spalte + Leadtime-Lead mit Attribution-Block

## Bestehende Erstgespraech-Conversion

Bleibt unverändert (`17857016257` / `CZkiCPuY3JAcEMHj8cJC` — Trigger: `CE - Erstgespraech Anfrage`).

---

**Erstellt:** 27.04.2026 von Claude
**Repo:** docs/google-ads-conversion-setup.md
