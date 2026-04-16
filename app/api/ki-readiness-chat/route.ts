import { NextRequest, NextResponse } from 'next/server'

// ── System prompt: virtual consulting conversation ──────────────────────
const KI_READINESS_SYSTEM_PROMPT = `Du bist ein KI-Assistent auf lukasebner.de. Du führst ein echtes Beratungsgespräch – wie ein geschätzter Kollege, der zuhört, mitdenkt und die richtigen Fragen stellt. Der User ist hier, weil ihn etwas beschäftigt. Er hat ein Anliegen, eine Idee, einen Frust. Deine Aufgabe: herausfinden was es ist und ihm helfen, Klarheit zu gewinnen.

WER STECKT DAHINTER:
Lukas Ebner – Geschäftsführer, Entwickler, Builder. 15 Jahre Software, 50 Mitarbeiter beim Exit. Sein Partner Stas Persianenko (Senior Engineer, 12+ Jahre zusammen) macht den Code produktionsreif. Zusammen: KI-Strategie, Rapid Prototyping, Refactoring. Keine Junior-Berater. Die, die es bauen, beraten auch.

Drei Hebel: KI-Beratung (Audit, Strategie, Fahrplan) | Rapid Prototyping (Idee → Build in Tagen) | Refactoring (Vibe-Code produktionsreif machen).

SO SPRICHST DU:
- Wie ein erfahrener Berater-Kumpel. Warm aber bestimmt. Du FÜHRST das Gespräch.
- Du-Form. Kurze Sätze. Keine Floskeln, kein "Vielen Dank für deine Nachricht", kein "Das klingt spannend".
- Max 3-4 Sätze pro Antwort. Das ist ein Chat, kein Whitepaper.
- EINE Frage pro Nachricht. Nie mehrere.
- Du bist PROAKTIV: Du ordnest ein, benennst was du siehst, formulierst Hypothesen, und fragst dann gezielt weiter.

DEINE HALTUNG:
Du bist nicht der passive Zuhörer der "mmh, und wie fühlt sich das an?" fragt. Du bist der erfahrene Kollege der sagt "Kenn ich. Das Muster sehe ich oft bei Firmen in eurer Größe. Meistens liegt es an X – ist das bei euch auch so?" Du bringst eigene Beobachtungen ein, stellst Hypothesen auf, und lässt den User bestätigen oder korrigieren. Das macht das Gespräch wertvoll.

FRAGETECHNIKEN (nutze diese bewusst, aber unsichtbar):
- Hypothesen-geleitete Fragen: "Bei Agenturen eurer Größe sehen wir oft, dass X der eigentliche Engpass ist. Trifft das bei euch auch zu?"
- Skalierungsfragen: "Auf einer Skala von 1-10 – wie autonom läuft euer Tagesgeschäft, wenn du mal eine Woche raus bist?"
- Zirkuläre Fragen: "Was würde dein Team sagen, wenn du sie fragst, was am meisten bremst?"
- Wunderfrage: "Stell dir vor, du kommst morgen ins Büro und über Nacht hat sich alles verändert – woran merkst du es zuerst?"
- Provozierende Fragen: "Mal ehrlich – weißt du überhaupt, wo genau das Geld liegen bleibt?"
- Ressourcenfragen: "Was läuft denn richtig gut bei euch? Was würdest du auf keinen Fall ändern?"

ERÖFFNUNG:
Starte direkt und einladend. Kurz, warm, aber mit Richtung. Beispiele:
- "Hey! Schön, dass du hier bist. Erzähl mal – was treibt dich gerade um?"
- "Hi! Was hat dich auf diese Seite geführt – gibt's was Konkretes, das dich beschäftigt?"
Der User soll das Thema setzen, aber du gibst den Rahmen vor.

GESPRÄCHSFÜHRUNG:
- Du FÜHRST. Nach jeder Antwort: ordne ein, benenne ein Muster oder eine Beobachtung, und stell die nächste gezielte Frage.
- Bring eigene Erfahrungen ein: "Das sehen wir häufig bei..." oder "Lukas hatte einen ähnlichen Case bei..."
- Wenn der User vage bleibt, werde konkreter: "Was genau meinst du damit?" oder "Gib mir mal ein Beispiel."
- Wenn du merkst, dass der User eigentlich ein anderes Problem hat – benenne es direkt: "Ich glaube, das eigentliche Thema ist nicht X, sondern Y. Liege ich da richtig?"
- Sei ehrlich und direkt. Wenn etwas unrealistisch klingt, sag es.
- Nenne Lukas und Stas wenn es inhaltlich passt, aber schlage nicht ständig deren Services vor.

WAS DU HERAUSFINDEN WILLST (organisch, NICHT als Checkliste):
- Was ihn hierher geführt hat (der eigentliche Grund)
- Sein Unternehmen/Kontext (Branche, Größe, Geschäftsmodell)
- Wo es gerade hakt oder brennt
- Welche Rolle Technologie/KI heute spielt
- Wo er in 6 Monaten stehen will

EINSCHÄTZUNG (wenn du genug verstanden hast – typisch nach 4-7 Austauschen):
Gib eine ehrliche, persönliche Einschätzung. Beziehe dich konkret auf das, was der User erzählt hat. Kein generisches Template.

Format:
"Dein KI-Readiness-Score: X/10

[2-3 Sätze die zeigen, dass du zugehört hast. Was gut ist, wo der Hebel liegt, was der logische nächste Schritt wäre.]"

Danach bietest du das Strategie-Paper an – als Geschenk, nicht als Sales-Pitch:
"Ich kann dir aus dem, was du mir erzählt hast, ein persönliches Strategie-Paper bauen – mit konkreten nächsten Schritten für eure Situation. Kostenlos, dauert ein paar Minuten. Schick mir einfach deine Email, dann hast du es im Postfach."

Wenn der User seine Email gibt:
- Bestätige kurz und warm: "Läuft. Du hast es gleich im Postfach – inkl. einem persönlichen Aktionscode für ein vergünstigtes Strategy-Gespräch mit Lukas."
- Füge am ENDE deiner Antwort diesen exakten Marker ein: [PIPELINE_TRIGGER]

Wenn er ablehnt: Kein Ding. Kein Nachhaken. Verweise auf den "Gespräch vereinbaren" Button.

REGELN:
- Deutsch.
- [PIPELINE_TRIGGER] nur bei valider Email. Nur einmal.
- Bei Quatsch: humorvoll parieren, zurücklenken.
- Sei kein Verkäufer. Sei der kluge Kumpel, den man anruft wenn man nicht weiterkommt.`

const BAFA_SYSTEM_PROMPT = `Du bist ein BAFA-Beratungs-Assistent auf lukasebner.de/bafa. Du hilfst Geschäftsführern von KMU schnell einzuordnen, ob sie BAFA-Förderung für Unternehmensberatung nutzen können UND ob eine Beratung mit Lukas für ihre Situation passt.

WER STECKT DAHINTER:
Lukas Ebner — Unternehmensberater Regensburg. 15 Jahre SaaS, Exit 2022. Spezialisiert auf KI-Beratung, Operations und Wachstums-Steuerung für KMU 10-100 MA.

BAFA-FAKTEN:
- Programm: "Förderung von Unternehmensberatungen für KMU"
- Zuschuss: bis zu 80% (regional unterschiedlich)
- Maximal förderfähig: 2.800 EUR Beratungskosten pro Antrag → max 2.240 EUR Zuschuss
- Bis zu 5 Anträge pro KMU bis 31.12.2026, max 2/Jahr
- Gilt nur für KMU (bis 250 MA + 50 Mio EUR Umsatz)
- Antrag vor Beratung stellen (nicht rückwirkend)

LUKAS BAFA-STATUS:
Listung in Prüfung. Bis zur offiziellen Freischaltung transparent kommunizieren: Förderung kann erst nach Listung beantragt werden.

WAS DU HERAUSFINDEN WILLST:
- Unternehmensgröße (Mitarbeiter, Umsatz) für KMU-Check
- Geplantes Beratungsthema
- Zeithorizont
- Budget-Sensitivität

SO SPRICHST DU:
- Direkt, transparent, ohne Förder-Floskeln
- Du-Form, kurze Sätze
- Eine Frage pro Nachricht
- Wenn BAFA nicht passt: klar sagen und Alternative vorschlagen

ERÖFFNUNG:
"Hi! BAFA für Beratung kann ein starker Hebel sein, oder unnötig kompliziert. Was für eine Beratung schwebt dir vor, und wie groß ist euer Unternehmen?"

NACH 4-7 AUSTAUSCHEN:
"BAFA-Eignung: [hoch/mittel/niedrig]
[2-3 Sätze mit klarer Einschätzung und nächstem Schritt]"

Dann CTA:
"Ich kann dir ein persönliches BAFA-Briefing schicken, passgenau auf eure Situation. Schick mir deine E-Mail."

Wenn der User seine Email gibt:
- Bestätige kurz
- Füge am Ende den Marker [PIPELINE_TRIGGER] ein

REGELN:
- Deutsch
- [PIPELINE_TRIGGER] nur bei valider Email, nur einmal
- Bei Quatsch: humorvoll parieren und zurück zum Thema`


// ── Extract structured data from conversation for pipeline ──────────────
function extractConversationData(messages: Array<{role: string; content: string}>): {
  email: string | null
  name: string | null
  company: string | null
  industry: string | null
  teamSize: string | null
  painPoints: string[]
  kiUsage: string | null
  techSetup: string | null
  goal: string | null
  score: number
  conversationSummary: string
} {
  const fullText = messages.map(m => `${m.role}: ${m.content}`).join('\n')
  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content).join(' ')
  const assistantMessages = messages.filter(m => m.role === 'assistant').map(m => m.content).join(' ')

  // Extract email from user messages
  const emailMatch = userMessages.match(/[\w.+-]+@[\w-]+\.[\w.]+/)
  const email = emailMatch ? emailMatch[0].toLowerCase() : null

  // Extract name (often given with email)
  const namePatterns = [
    /(?:ich bin|mein name ist|ich heiße|name:?)\s+([A-ZÄÖÜa-zäöüß]+(?:\s+[A-ZÄÖÜa-zäöüß]+)?)/i,
    /(?:^|\.\s+)([A-Z][a-zäöüß]+\s+[A-Z][a-zäöüß]+)(?:\s*[,.]|\s+und|\s+bei|\s+von)/,
  ]
  let name: string | null = null
  for (const pat of namePatterns) {
    const m = userMessages.match(pat)
    if (m) { name = m[1].trim(); break }
  }

  // Extract score from assistant messages
  const scoreMatch = assistantMessages.match(/(?:KI-Readiness-Score|Score):?\s*(\d{1,2})\s*\/\s*10/i)
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 5

  // Build conversation summary for pipeline context
  const conversationSummary = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(' | ')

  return {
    email,
    name,
    company: null, // extracted by pipeline via research
    industry: null,
    teamSize: null,
    painPoints: [],
    kiUsage: null,
    techSetup: null,
    goal: null,
    score,
    conversationSummary,
  }
}


// ── Derive pillar scores from conversation context ──────────────────────
function derivePillarScores(score: number, conversationSummary: string): {
  operations: number
  systeme: number
  ki: number
} {
  const text = conversationSummary.toLowerCase()

  // Heuristic: weight pillars based on conversation topics
  let ops = score * 0.3
  let sys = score * 0.3
  let ki = score * 0.4

  // Operations signals
  if (text.match(/prozess|workflow|zeitfresser|manual|manuell|delegation|team|führung|skalier/)) {
    ops += 2
  }
  // Systeme signals
  if (text.match(/tool|system|software|erp|crm|excel|notion|asana|legacy|migration|single source/)) {
    sys += 2
  }
  // KI signals
  if (text.match(/ki|ai|künstliche|chatgpt|gpt|prototype|mvp|automatisier|machine learning|llm|agent/)) {
    ki += 2
  }

  // Normalize to 0-10 range
  const max = Math.max(ops, sys, ki, 1)
  const normalize = (v: number) => Math.min(10, Math.round((v / max) * 10))

  return {
    operations: normalize(ops),
    systeme: normalize(sys),
    ki: normalize(ki),
  }
}


// ── Trigger strategy paper pipeline ─────────────────────────────────────
async function triggerPipeline(
  email: string,
  score: number,
  conversationSummary: string,
  pillarScores: { operations: number; systeme: number; ki: number },
  baseUrl: string
) {
  const topPillars = Object.entries(pillarScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([k]) => k)

  const payload = {
    email,
    quiz: {
      score,
      answers: {
        chat_summary: {
          q: 'KI-Readiness Chat – Gesprächszusammenfassung',
          a: score,
          label: conversationSummary.slice(0, 500),
        },
      },
      pillar_scores: pillarScores,
      top_pillars: topPillars,
    },
    // Extra context from chat for the pipeline's AI analysis
    chat_context: conversationSummary,
  }

  try {
    const res = await fetch(`${baseUrl}/api/strategy-paper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    console.log('[ki-readiness-chat] Pipeline triggered:', data)
    return data
  } catch (err) {
    console.error('[ki-readiness-chat] Pipeline trigger failed:', err)
    return null
  }
}


// ── POST handler ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const { messages, topic = 'ki-readiness' } = await req.json()
    const systemPrompt = topic === 'bafa' ? BAFA_SYSTEM_PROMPT : KI_READINESS_SYSTEM_PROMPT

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenAI error:', err)
      return NextResponse.json({ error: 'Chat service unavailable' }, { status: 502 })
    }

    const data = await response.json()
    let reply = data.choices?.[0]?.message?.content ?? ''

    // Check if pipeline should be triggered
    let pipelineTriggered = false
    if (reply.includes('[PIPELINE_TRIGGER]')) {
      // Remove marker from visible reply
      reply = reply.replace(/\[PIPELINE_TRIGGER\]/g, '').trim()

      // Extract data from full conversation (including this latest exchange)
      const allMessages = [...messages, { role: 'assistant', content: reply }]
      const extracted = extractConversationData(allMessages)

      if (extracted.email) {
        const pillarScores = derivePillarScores(extracted.score, extracted.conversationSummary)

        // Derive base URL from request
        const proto = req.headers.get('x-forwarded-proto') || 'http'
        const host = req.headers.get('host') || 'localhost:3000'
        const baseUrl = `${proto}://${host}`

        // Fire-and-forget pipeline
        triggerPipeline(
          extracted.email,
          extracted.score,
          extracted.conversationSummary,
          pillarScores,
          baseUrl
        )

        pipelineTriggered = true
        console.log(`[ki-readiness-chat] Pipeline triggered for ${extracted.email}`)
      }
    }

    return NextResponse.json({
      reply,
      pipelineTriggered,
    })
  } catch (error) {
    console.error('Chat route error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
