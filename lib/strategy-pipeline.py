#!/usr/bin/env python3
"""
Strategy Paper Pipeline – Full E2E Flow
Email + Quiz → Research → AI Analysis → PDF → Action Code → Email via Resend

Usage:
  python strategy-pipeline.py '{"email":"info@fracto.de","quiz":{...}}'
  python strategy-pipeline.py --test          # Run with sample data
  python strategy-pipeline.py --test-email    # Test with actual Resend delivery

Env vars: ANTHROPIC_API_KEY, SERPER_API_KEY, RESEND_API_KEY
"""

import json
import sys
import os
import re
import hashlib
import base64
import urllib.request
import urllib.error
from datetime import datetime, timedelta
from pathlib import Path


def http_post(url: str, payload: dict, headers: dict, timeout: int = 30) -> dict:
    """Drop-in replacement for requests.post(..., json=payload) using urllib (built-in)."""
    data = json.dumps(payload).encode("utf-8")
    # Ensure a real User-Agent so Cloudflare doesn't block us (error 1010)
    if "User-Agent" not in headers:
        headers["User-Agent"] = "lukasebner-pipeline/1.0"
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {e.code} from {url}: {body}") from e

# ── Load env from .env / .env.local ──
def load_env():
    for envfile in [".env", ".env.local"]:
        p = Path(__file__).resolve().parent.parent / envfile
        if not p.exists():
            p = Path(f"/sessions/practical-tender-faraday/mnt/ebner/{envfile}")
        if p.exists():
            for line in p.read_text().splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    key, val = k.strip(), v.strip()
                    if val and not os.environ.get(key):
                        os.environ[key] = val

load_env()

SERPER_KEY = os.environ.get("SERPER_API_KEY", "")
ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
RESEND_KEY = os.environ.get("RESEND_API_KEY", "")

# ── Paths ──
PROJECT_ROOT = Path(__file__).resolve().parent.parent
FONTS_DIR = PROJECT_ROOT / "public" / "fonts"
ASSETS_DIR = PROJECT_ROOT / "public" / "images" / "paper"
DATA_DIR = PROJECT_ROOT / "data"
OUTPUT_DIR = PROJECT_ROOT / "data" / "papers"

# ── Ensure dirs ──
DATA_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# ── Freemail detection ──
FREE_PROVIDERS = {
    "gmail.com","yahoo.com","hotmail.com","outlook.com","live.com","live.de",
    "web.de","gmx.de","gmx.net","gmx.at","gmx.ch","t-online.de","icloud.com",
    "yahoo.de","aol.com","mail.de","freenet.de","posteo.de","protonmail.com",
    "proton.me","tutanota.com","mailbox.org","arcor.de","vodafone.de",
    "1und1.de","ionos.de","me.com","mac.com","ymail.com","googlemail.com",
}


def extract_domain(email: str):
    domain = email.split("@")[-1].strip().lower()
    return None if domain in FREE_PROVIDERS else domain


def _build_attribution_html(form_data: dict) -> str:
    """Build HTML attribution block from utm/gclid fields in form_data."""
    if not form_data:
        return ""
    keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid"]
    labels = {
        "utm_source": "Source",
        "utm_medium": "Medium",
        "utm_campaign": "Campaign",
        "utm_content": "Content",
        "utm_term": "Term",
        "gclid": "gclid",
    }
    parts = [f"{labels[k]}: {form_data[k]}" for k in keys if form_data.get(k)]
    if not parts:
        return ""
    return f"<p><strong>Attribution:</strong> {' · '.join(parts)}</p>"


# ══════════════════════════════════════════════════════════
#  STEP 1: RESEARCH
# ══════════════════════════════════════════════════════════

def serper(query: str, stype: str = "search", num: int = 10) -> dict:
    url = f"https://google.serper.dev/{stype}"
    headers = {"X-API-KEY": SERPER_KEY, "Content-Type": "application/json"}
    payload = {"q": query, "gl": "de", "hl": "de", "num": num}
    return http_post(url, payload, headers, timeout=15)


def scrape_and_extract(url: str) -> str:
    """Crawl page via Serper Scrape, extract facts via Haiku."""
    hdrs = {"X-API-KEY": SERPER_KEY, "Content-Type": "application/json"}
    try:
        result = http_post("https://scrape.serper.dev", {"url": url}, hdrs, timeout=20)
        page_text = result.get("text", "")[:8000]
    except Exception as e:
        return f"[Crawl failed: {e}]"

    if not page_text or len(page_text) < 50:
        return "[Page empty or blocked]"

    api_headers = {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    payload = {
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 1500,
        "messages": [{"role": "user", "content": (
            f"URL: {url}\n\nPAGE CONTENT:\n{page_text}\n\n"
            "AUFGABE: Extrahiere ALLE Fakten: Firmenname, Rechtsform, Personen (Namen + Rollen), "
            "Adresse, Kontaktdaten, Gründungsjahr, Mitarbeiterzahl, Produkte/Services, "
            "Kunden/Referenzen, Technologien, Preise, USPs. Nur Fakten, keine Interpretation.\n\n"
            "WICHTIG: Gib NUR Informationen aus, die EXPLIZIT im Page Content stehen. Erfinde NICHTS."
        )}]
    }
    try:
        result = http_post("https://api.anthropic.com/v1/messages", payload, api_headers, timeout=30)
        return result["content"][0]["text"]
    except Exception as e:
        return f"[Analysis failed: {e}]"


def deep_research(domain: str) -> str:
    """Full research: discover → crawl → external enrichment."""
    company = domain.split(".")[0]
    all_data = []

    # Phase 1: Discovery
    log("PHASE 1: Seiten-Discovery...")
    data = serper(f"site:{domain}", num=20)
    discovered = [item.get("link", "") for item in data.get("organic", []) if domain in item.get("link", "")]
    log(f"  → {len(discovered)} Seiten gefunden")

    must_crawl = [f"https://{domain}{p}" for p in [
        "", "/kontakt", "/impressum", "/about", "/ueber-uns", "/team",
        "/leistungen", "/services", "/referenzen", "/kunden", "/produkte",
        "/portfolio", "/partner",
    ]]
    all_urls = list(dict.fromkeys(discovered + must_crawl))

    # Phase 2: Deep Crawl
    log("PHASE 2: Deep Crawl...")
    crawled = 0
    for i, url in enumerate(all_urls[:15], 1):
        log(f"  [{i}/{min(len(all_urls), 15)}] {url}")
        extraction = scrape_and_extract(url)
        if not extraction.startswith("["):
            all_data.append(f"\n## CRAWLED: {url}\n{extraction}")
            crawled += 1
    log(f"  → {crawled} Seiten erfolgreich gecrawlt")

    # Phase 3: External
    log("PHASE 3: Externe Recherche...")
    external = [
        ("LINKEDIN_COMPANY", f"site:linkedin.com/company \"{company}\"", "search", 5),
        ("LINKEDIN_PEOPLE", f"site:linkedin.com/in \"{company}\" OR \"{domain}\" Geschäftsführer OR CEO OR Gründer", "search", 10),
        ("KUNUNU", f"\"{company}\" OR \"{domain}\" kununu Mitarbeiter", "search", 3),
        ("NEWS", f"\"{company}\" \"{domain}\"", "news", 5),
        ("HANDELSREGISTER", f"site:{domain} OR \"{company}\" \"{domain}\" handelsregister OR impressum", "search", 3),
    ]
    for label, query, stype, num in external:
        log(f"  → {label}")
        try:
            data = serper(query, stype, num)
            lines = [f"\n## EXTERNAL: {label}\n"]
            for item in data.get("organic", data.get("news", [])):
                lines.append(f"- [{item.get('title', '')}]({item.get('link', '')}): {item.get('snippet', '')}")
            if "knowledgeGraph" in data:
                lines.append(f"Knowledge Graph: {json.dumps(data['knowledgeGraph'], ensure_ascii=False)}")
            all_data.append("\n".join(lines))
        except Exception as e:
            all_data.append(f"\n## EXTERNAL: {label}\nError: {e}")

    return "\n\n".join(all_data)


# ══════════════════════════════════════════════════════════
#  STEP 2: AI ANALYSIS → STRUCTURED JSON
# ══════════════════════════════════════════════════════════

LUKAS_CONTEXT = """
Lukas Ebner ist Unternehmensberater aus Regensburg. 25+ Jahre im digitalen Projektgeschäft. Hat seine Firma eins+null aufgebaut (Vertriebsplattform für Energiewirtschaft, Kunden wie EnBW, E.ON) und 2022 für einen fast achtstelligen Betrag verkauft.

Seine drei Beratungssäulen:
1. Operations & Führung – Vom Gründer-Flaschenhals zu skalierbaren Strukturen
2. Systeme & Automatisierung – Hier empfiehlt er Leadtime (leadtime.app): eine PSA-Plattform für digitale Dienstleister. Projektplanung + Kapazitätsmanagement + Finanzen in einer Plattform. 29€/User/Monat.
3. KI-Readiness & Prototyping – KI-Strategie, Team-Enablement, Wettbewerbsvorteile durch KI
"""

NO_HALLUCINATION = """
ABSOLUTE REGEL – KEINE HALLUZINATIONEN:
- NUR Informationen aus den Recherche-Daten verwenden
- Unbelegbare Felder KOMPLETT WEGLASSEN
- ERFINDE NIEMALS Namen, Zahlen, Kunden, Technologien
- Im Zweifel: WEGLASSEN
- company_name: AUSSCHLIESSLICH aus den "## CRAWLED: {domain}"-Abschnitten entnehmen.
  Externe Quellen (LinkedIn, Handelsregister, News) können andere Firmen mit ähnlichem Namen enthalten – diese IGNORIEREN.
  Wenn der Firmenname auf der gecrawlten Website nicht eindeutig steht: null setzen.
"""

STYLE = """
STIL: Deutsch, Du-Form, direkt, konkret. Kein generisches Consulting-Blabla. Jeder Satz braucht Bezug zu den Recherche-Daten oder Quiz-Antworten.
"""


def build_quiz_summary(quiz: dict) -> str:
    lines = []
    for key, item in quiz["answers"].items():
        pillar = "Operations" if key.startswith("ops") else ("Systeme" if key.startswith("sys") else "KI")
        if isinstance(item, dict):
            lines.append(f"  [{pillar}] \"{item.get('q', key)}\" → {item.get('label', '?')} ({item.get('a', '?')}/3)")
        else:
            # Fallback: item is just a score (int)
            lines.append(f"  [{pillar}] {key}: {item}/3")
    return "\n".join(lines)


def resolve_contact_name(email: str, research: str = None):
    """
    Try to identify who the email belongs to.
    1. Parse local part (vorname.nachname@ or vorname@ patterns)
    2. If research data available, try to match against found persons
    Returns first name if confident, None otherwise.
    """
    local = email.split("@")[0].lower().strip()

    # Skip generic addresses
    generic = {"info", "contact", "kontakt", "hello", "hi", "mail", "office",
               "team", "support", "admin", "billing", "sales", "hallo", "post"}
    if local in generic:
        # Can't determine who this is
        return None

    # Try vorname.nachname or vorname_nachname pattern
    parts = re.split(r'[._\-]', local)
    candidate_first = None
    if len(parts) >= 2:
        # Likely vorname.nachname
        candidate_first = parts[0].capitalize()
        candidate_last = parts[-1].capitalize()
    elif len(parts) == 1 and len(local) > 2:
        # Could be just a first name (lukas@, laurin@)
        candidate_first = local.capitalize()
        candidate_last = None
    else:
        return None

    full_name = f"{candidate_first} {candidate_last}" if candidate_last else candidate_first

    # If we have research data, try to verify the name appears there
    if research and candidate_first:
        research_lower = research.lower()
        if candidate_last and candidate_last.lower() in research_lower:
            return full_name
        if candidate_first.lower() in research_lower:
            return full_name
        # Name not found in research – still return if clear vorname.nachname pattern
        if candidate_last and len(candidate_first) > 2 and len(candidate_last) > 2:
            return full_name

    # Without research, only return if clearly a name pattern (vorname.nachname)
    if not research and candidate_last and len(candidate_first) > 2 and len(candidate_last) > 2:
        return full_name

    return candidate_first if candidate_first and len(candidate_first) > 2 else None


def generate_structured_paper(email: str, quiz: dict, domain: str = None, research: str = None, chat_context: str = None) -> dict:
    """Generate paper as structured JSON via Claude Sonnet."""
    quiz_text = build_quiz_summary(quiz)
    is_company = domain is not None and research is not None

    # Resolve contact name from email + research
    resolved_name = resolve_contact_name(email, research)

    contact_instruction = ""
    if resolved_name:
        contact_instruction = f"""
## EMPFÄNGER
Die E-Mail-Adresse "{email}" lässt darauf schließen, dass der Empfänger "{resolved_name}" heißt.
Verwende diesen Namen im personal_cta_text und setze contact_name auf "{resolved_name}".
"""
    else:
        contact_instruction = f"""
## EMPFÄNGER
Die E-Mail-Adresse "{email}" lässt KEINEN Rückschluss auf den Empfänger zu (generische Adresse wie info@, team@ etc.).
Verwende KEINEN persönlichen Namen. Schreibe den personal_cta_text in allgemeiner Du-Form.
Setze contact_name auf null.
"""

    research_block = ""
    if is_company:
        research_block = f"""
## RECHERCHE-DATEN ZUM UNTERNEHMEN
Domain: {domain}
Email: {email}
WICHTIG: Der Firmenname (company_name) MUSS exakt so lauten wie er auf den gecrawlten Seiten der Domain "{domain}" steht (Abschnitte "## CRAWLED: ..."). Externe Suchergebnisse (LinkedIn, Handelsregister, News) können andere Firmen enthalten – für den company_name AUSSCHLIESSLICH die gecrawlten Seiten verwenden.
{contact_instruction}
{research}
"""
    else:
        research_block = f"""
## HINWEIS
Der Nutzer hat eine private E-Mail ({email}) verwendet. Keine Unternehmensdaten verfügbar.
Paper basiert rein auf Quiz-Antworten. KEINE Annahmen über Firma, Branche oder Personen.
Am Ende einen Tipp einfügen: "Für ein noch präziseres Paper nutze deine geschäftliche E-Mail-Adresse."
{contact_instruction}
"""

    prompt = f"""Erstelle ein personalisiertes Strategie-Paper als STRUKTURIERTES JSON.

{NO_HALLUCINATION}

## WER IST LUKAS EBNER?
{LUKAS_CONTEXT}

{research_block}

## QUIZ-ERGEBNISSE
Unternehmerischer Freiheitsgrad: {quiz['score']}%
Pillar-Scores: Operations {quiz['pillar_scores']['operations']}%, Systeme {quiz['pillar_scores']['systeme']}%, KI {quiz['pillar_scores']['ki']}%

Einzelantworten:
{quiz_text}

{f"""## CHAT-KONTEXT (KI-Readiness-Beratungsgespräch)
Der Nutzer hat ein interaktives Beratungsgespräch auf der Website geführt. Die folgenden Aussagen kommen direkt vom Nutzer und sind besonders wertvoll für die Analyse:

{chat_context}

WICHTIG: Nutze diese Chat-Informationen als PRIMÄRQUELLE für die Analyse. Sie enthalten oft konkretere Details als der Quiz allein (Branche, Pain Points, Tech-Stack, Ziele).
""" if chat_context else ""}
## OUTPUT FORMAT – EXAKT DIESES JSON-SCHEMA

Antworte mit EXAKT diesem JSON (keine Markdown-Codeblöcke, kein Text drumherum):

{{
  "company_name": "Firmenname oder null",
  "contact_name": "Vorname der Kontaktperson oder null",
  "profile_lines": [["Label", "Wert"], ...],
  "executive_summary": "3-5 Sätze...",
  "personal_cta_text": "Persönlicher Text von Lukas an den Empfänger, 3-4 Sätze, bezogen auf die konkrete Situation des Unternehmens",
  "sections": [
    {{
      "title": "Bereichstitel (z.B. KI-Readiness & Prototyping)",
      "score": 12,
      "diagnosis": "Was die Quiz-Antworten konkret verraten...",
      "quote": "Ein prägnanter Satz als Zitat-Block",
      "quick_wins": ["Maßnahme 1", "Maßnahme 2", "Maßnahme 3"],
      "strategic": ["Maßnahme 1", "Maßnahme 2", "Maßnahme 3"],
      "leadtime_pitch": "Empfehlung für Leadtime (nur bei Systeme < 60%) oder null"
    }}
  ]
}}

REGELN:
- profile_lines: NUR Felder mit belegbaren Daten. Bei Freemail: leeres Array.
- sections: Sortiert nach Score (schlechtester zuerst). Genau 3 Sections.
- section scores: Aus pillar_scores übernehmen (operations, systeme, ki).
- leadtime_pitch: NUR in der Systeme-Section und NUR wenn Score < 60%.
- contact_name: NUR setzen wenn im EMPFÄNGER-Block ein Name angegeben ist. Sonst null.
- personal_cta_text: Persönlich, bezogen auf das Unternehmen/die Situation. Den Empfänger NUR beim Namen nennen wenn contact_name gesetzt ist. Bei generischen Adressen (info@, team@, etc.) KEINEN Namen verwenden.
- quote: Provokant, auf den Punkt, bezogen auf die konkrete Situation.

{STYLE}"""

    raw = _call_claude(prompt)
    # Extract JSON from response (strip any markdown)
    raw = raw.strip()
    if raw.startswith("```"):
        raw = re.sub(r'^```\w*\n?', '', raw)
        raw = re.sub(r'\n?```$', '', raw)
    return json.loads(raw)


def _call_claude(prompt: str) -> str:
    hdrs = {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    payload = {
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 6000,
        "messages": [{"role": "user", "content": prompt}]
    }
    result = http_post("https://api.anthropic.com/v1/messages", payload, hdrs, timeout=90)
    return result["content"][0]["text"]


# ══════════════════════════════════════════════════════════
#  STEP 3: PDF GENERATION
# ══════════════════════════════════════════════════════════

def generate_pdf(data: dict, output_path: str):
    """Import and run the PDF generator."""
    # generate_pdf.py lives in the same directory as this script (lib/)
    pdf_script = Path(__file__).resolve().parent / "generate_pdf.py"
    if not pdf_script.exists():
        # Fallback: check project root
        pdf_script = Path(__file__).resolve().parent.parent / "generate_pdf.py"

    # Import dynamically
    import importlib.util
    spec = importlib.util.spec_from_file_location("generate_pdf", str(pdf_script))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)

    pdf = mod.StrategyPDF(data)
    pdf.build(output_path)


# ══════════════════════════════════════════════════════════
#  STEP 4: ACTION CODE
# ══════════════════════════════════════════════════════════

def generate_action_code(company_name: str, email: str) -> str:
    seed = f"{company_name}:{email}:{datetime.now().strftime('%Y-%m')}".lower()
    short_hash = hashlib.sha256(seed.encode()).hexdigest()[:6].upper()
    prefix = (company_name or "").split()[0].upper()[:8] or "STRATEGIE"
    return f"{prefix}-{short_hash}"


def register_code_locally(code: str, email: str, company: str, deadline_iso: str):
    """Write directly to data/action-codes.json (for local/server use)."""
    codes_file = DATA_DIR / "action-codes.json"
    try:
        codes = json.loads(codes_file.read_text()) if codes_file.exists() else []
    except Exception:
        codes = []

    entry = {
        "code": code.upper(),
        "email": email,
        "company": company or "",
        "deadline": deadline_iso,
        "createdAt": datetime.now().isoformat(),
    }

    # Upsert
    existing = next((i for i, c in enumerate(codes) if c["code"] == code.upper()), None)
    if existing is not None:
        codes[existing] = {**codes[existing], **entry}
    else:
        codes.append(entry)

    codes_file.write_text(json.dumps(codes, indent=2, ensure_ascii=False))
    log(f"  ✓ Action code {code} registered locally (deadline: {deadline_iso})")


# ══════════════════════════════════════════════════════════
#  STEP 5: EMAIL VIA RESEND
# ══════════════════════════════════════════════════════════

def send_paper_email(email: str, company_name: str, pdf_path: str, action_code: str, deadline: str):
    """Send the strategy paper download link via Resend."""
    if not RESEND_KEY:
        log("  ⚠ RESEND_API_KEY not set – skipping email")
        return False

    company_ref = company_name or "dein Unternehmen"

    # Build download link (served by /api/papers/[slug])
    pdf_filename = Path(pdf_path).name
    download_url = f"https://lukasebner.de/api/papers/{pdf_filename}"

    payload = {
        "from": "Lukas Ebner <lukas@lukasebner.de>",
        "to": [email],
        "subject": f"Dein persönliches Strategiepapier{' für ' + company_name if company_name else ''}",
        "html": f"""<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">

  <p style="font-size: 16px; line-height: 1.6;">Hi{' ' + company_ref if company_name else ''},</p>

  <p style="font-size: 16px; line-height: 1.6;">dein persönliches Strategiepapier ist fertig – basierend auf deinen Quiz-Ergebnissen{' und einer Analyse von ' + company_ref if company_name else ''}.</p>

  <p style="margin: 24px 0;">
    <a href="{download_url}" style="display: inline-block; background: #F44900; color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 16px; font-weight: 600;">Strategiepapier herunterladen (PDF)</a>
  </p>

  <p style="font-size: 16px; line-height: 1.6;">Darin findest du eine detaillierte Auswertung mit konkreten Handlungsempfehlungen für die Bereiche Operations, Systeme und KI-Readiness.</p>

  <div style="background: #F5F5F0; padding: 20px; margin: 24px 0; border-left: 4px solid #F44900;">
    <p style="margin: 0 0 8px 0; font-size: 13px; color: #7a7a7a; text-transform: uppercase; letter-spacing: 1px;">Dein Aktionscode</p>
    <p style="margin: 0 0 8px 0; font-size: 24px; font-weight: bold; color: #F44900;">{action_code}</p>
    <p style="margin: 0; font-size: 14px; color: #4a4a4a;">Strategy Workshop für 500 € statt 1.000 € · gültig bis {deadline}</p>
  </div>

  <p style="font-size: 16px; line-height: 1.6;">
    <a href="https://lukasebner.de/erstgespraech" style="color: #F44900; font-weight: bold;">→ Erstgespräch buchen</a> und den Aktionscode eingeben.
  </p>

  <p style="font-size: 16px; line-height: 1.6;">Kein Pitch, kein Verkaufsgespräch. Einfach ein ehrliches Gespräch darüber, was bei euch als nächstes dran ist.</p>

  <p style="font-size: 16px; line-height: 1.6; margin-top: 32px;">Lukas</p>

  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E8E5DE;">
    <p style="font-size: 13px; color: #7a7a7a; margin: 0; line-height: 1.6;">Lukas Ebner<br>Wachstumcoach GmbH | HRB 19991, Amtsgericht Regensburg<br>Yorckstr. 22, 93049 Regensburg | Fon: +49 941 463 909 80<br><a href="https://lukasebner.de" style="color: #7a7a7a;">lukasebner.de</a></p>
  </div>

</div>""",
    }

    try:
        result = http_post(
            "https://api.resend.com/emails",
            payload,
            {
                "Authorization": f"Bearer {RESEND_KEY}",
                "Content-Type": "application/json"
            },
            timeout=30
        )
        log(f"  ✓ Email sent to {email} (Resend ID: {result.get('id', '?')})")
        return True
    except Exception as e:
        log(f"  ✗ Email failed: {e}")
        return False


# ══════════════════════════════════════════════════════════
#  STEP 2b: LEADTIME CRM
# ══════════════════════════════════════════════════════════

LEADTIME_BASE = "https://leadtime.app/api/public"
LEADTIME_TOKEN = os.environ.get("LEADTIME_EBNER_PAT", "") or os.environ.get("LEADTIME_API_TOKEN", "")

# EBNER workspace · SALES project (centralized sales pipeline)
SALES = {
    "projectId": "414c2c89-29a4-4a3c-b371-114da2c25dd5",   # SALES-22
    "typeId": "4d5a972a-8ec6-4090-a11e-e998f0047530",      # Management
    "statusNeu": "0d79b3dc-c71f-470c-8ea6-ac86bbfcd163",   # Neu
    "lukasUserId": "8dcc2862-ed49-4830-8fe6-c1404e372921",
}

SOURCE_TAGS = {
    "website-erstgespraech": "2002533c-c2b5-43b8-bbdd-8e5383366d37",
    "website-ebook":         "70ea3b5a-ac0a-46e8-b7c0-126adf58fd8e",
    "website-freiheitstest": "8b5a0c18-0a4b-424c-80a1-4a66d4b25456",
    "website-unverzichtbar": "16848b43-b6f5-4923-ae22-5bba127b233c",
    "website-chatbot":       "a5adc642-477d-4b67-8f18-628dcaf30512",
    "linkedin-dm":           "18325108-0bf7-4cba-a377-835dbe3c1751",
    "linkedin-comment":      "89f0829f-4176-41bc-81f5-1f584076e665",
    "botdog-accepted":       "7c3a49d3-1f1b-40b7-b5e9-61bf92b81484",
    "manual":                "3d2b09bc-7aef-425e-b105-e69f2ed74f66",
}

SOURCE_LABELS = {
    "website-erstgespraech": "Erstgespräch-Anfrage (Website)",
    "website-ebook":         "Ebook-Download (Cost of Chaos)",
    "website-freiheitstest": "Freiheitstest-Quiz",
    "website-unverzichtbar": "(Un)verzichtbar Leadmagnet",
    "website-chatbot":       "KI-Readiness-Chatbot",
    "linkedin-dm":           "LinkedIn DM",
    "linkedin-comment":      "LinkedIn Kommentar",
    "botdog-accepted":       "Botdog – Connection accepted",
    "manual":                "Manuell eingetragen",
}

# Legacy → canonical mapping for spawn callers (contact, ebook, strategy-paper)
LEGACY_SOURCE_MAP = {
    "ebook":         "website-ebook",
    "freiheitstest": "website-freiheitstest",
    "erstgespraech": "website-erstgespraech",
    "contact":       "website-erstgespraech",
    "unverzichtbar": "website-unverzichtbar",
}


def normalize_source(src: str) -> str:
    if src in SOURCE_TAGS:
        return src
    if src in LEGACY_SOURCE_MAP:
        return LEGACY_SOURCE_MAP[src]
    return "manual"


def lt_get(path):
    req = urllib.request.Request(
        f"{LEADTIME_BASE}{path}",
        headers={"Authorization": f"Bearer {LEADTIME_TOKEN}", "Content-Type": "application/json", "User-Agent": "lukasebner-pipeline/1.0"},
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())


def lt_post(path, body):
    return http_post(
        f"{LEADTIME_BASE}{path}", body,
        {"Authorization": f"Bearer {LEADTIME_TOKEN}", "Content-Type": "application/json"},
        timeout=15,
    )


def lt_patch(path, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{LEADTIME_BASE}{path}", data=data, method="PATCH",
        headers={"Authorization": f"Bearer {LEADTIME_TOKEN}", "Content-Type": "application/json", "User-Agent": "lukasebner-pipeline/1.0"},
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())


def extract_org_fields_from_research(research, paper_data):
    """Extract structured org fields from research text + paper profile_lines."""
    fields = {
        "address_street": "",
        "address_zip": "",
        "address_city": "",
        "address_country": "Deutschland",
        "phone": "",
        "email": "",
        "legal_form": "",
        "ceo_name": "",
        "ceo_position": "",
        "employee_count": "",
        "founding_year": "",
        "register_number": "",
        "register_court": "",
    }
    if not research:
        return fields

    # Extract from profile_lines first (already parsed by Claude)
    for line in (paper_data or {}).get("profile_lines", []):
        if len(line) < 2:
            continue
        label, value = line[0].lower(), line[1]
        if "rechtsform" in label or "gesellschaftsform" in label:
            fields["legal_form"] = value
        elif "geschäftsführ" in label or "ceo" in label or "gründer" in label or "founder" in label:
            # May contain multiple names comma-separated – take first only
            first_person = value.split(",")[0].strip()
            fields["ceo_name"] = first_person
            fields["ceo_position"] = line[0]
        elif "mitarbeiter" in label or "team" in label:
            fields["employee_count"] = value
        elif "gründung" in label or "gegründet" in label:
            fields["founding_year"] = value
        elif "standort" in label or "sitz" in label or "adresse" in label:
            fields["address_city"] = value

    # Parse research text for address, phone, email via regex
    text = research

    # Phone: +49 xxx or 0xxx patterns – only digits, spaces, dashes, slashes after prefix
    phone_m = re.search(r'(?:Tel(?:efon)?|Fon|Phone)[:\s]*([+\d][\d\s/\-()]{6,18}\d)', text, re.IGNORECASE)
    if not phone_m:
        phone_m = re.search(r'(\+49[\s\d\-/()]{6,18}\d)', text)
    if phone_m:
        # Clean: only keep digits, +, spaces, dashes
        raw_phone = phone_m.group(1).strip()
        fields["phone"] = re.sub(r'[^\d+\s\-/]', '', raw_phone).strip()

    # Email from impressum – look for any email in research text
    email_m = re.search(r'(?:E-?Mail|Mail|Kontakt)[:\s]*([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})', text, re.IGNORECASE)
    if not email_m:
        # Broader: find any email that's not the quiz-taker's
        all_emails = re.findall(r'([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})', text)
        for found_email in all_emails:
            # Skip generic patterns that might be examples
            if found_email.endswith(".png") or found_email.endswith(".jpg"):
                continue
            fields["email"] = found_email
            break
    else:
        fields["email"] = email_m.group(1).strip()

    # Address: Street + Number pattern (German street names)
    addr_m = re.search(r'([A-ZÄÖÜ][a-zäöüß]+(?:str(?:aße|\.)|weg|gasse|platz|ring|allee|damm|straße)\s*\d+[a-zA-Z]?)', text)
    if addr_m:
        fields["address_street"] = addr_m.group(1).strip()

    # PLZ + City
    plz_m = re.search(r'(\d{5})\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[a-zäöüß]+)?)', text)
    if plz_m:
        fields["address_zip"] = plz_m.group(1)
        fields["address_city"] = plz_m.group(2).strip()

    # Rechtsform from text if not from profile
    if not fields["legal_form"]:
        rf_m = re.search(r'(GmbH|UG|AG|e\.?K\.?|OHG|KG|GbR|SE|mbH)', text)
        if rf_m:
            fields["legal_form"] = rf_m.group(1)

    # Handelsregister / HRB number
    hrb_m = re.search(r'(HRB?\s*\d+)', text, re.IGNORECASE)
    if hrb_m:
        fields["register_number"] = hrb_m.group(1).strip()

    # Registergericht
    rg_m = re.search(r'(?:Amtsgericht|Registergericht|AG)\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[a-zäöüß]+)?)', text)
    if rg_m:
        fields["register_court"] = rg_m.group(1).strip()

    # Geschäftsführer from text – take FIRST name only (vor dem Komma)
    if not fields["ceo_name"]:
        gf_m = re.search(r'Geschäftsführ(?:er|ung|erin)[:\s]*([A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+)', text)
        if gf_m:
            fields["ceo_name"] = gf_m.group(1).strip()
            fields["ceo_position"] = "Geschäftsführer"

    return fields


def _esc(s):
    if s is None:
        return ""
    s = str(s)
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;").replace("'", "&#39;"))


def _build_sales_description(email, source, name=None, company=None, position=None,
                              phone=None, website=None, linkedin_url=None,
                              message=None, quiz=None, top_pillars=None,
                              executive_summary=None, profile_lines=None,
                              org_fields=None, form_data=None):
    """Build HTML description for a SALES ticket. Mirrors lib/leadtime.ts buildDescription."""
    label = SOURCE_LABELS.get(source, source)
    now_str = datetime.now().strftime("%d.%m.%Y, %H:%M")
    parts = [f"<p>🟢 <strong>{_esc(label)}</strong> · {_esc(now_str)}</p>"]

    contact = []
    if name:         contact.append(f"<li><strong>Name:</strong> {_esc(name)}</li>")
    contact.append(f"<li><strong>Email:</strong> <a href=\"mailto:{_esc(email)}\">{_esc(email)}</a></li>")
    if phone:        contact.append(f"<li><strong>Telefon:</strong> {_esc(phone)}</li>")
    if position:     contact.append(f"<li><strong>Position:</strong> {_esc(position)}</li>")
    if company:      contact.append(f"<li><strong>Firma:</strong> {_esc(company)}</li>")
    if website:      contact.append(f"<li><strong>Website:</strong> <a href=\"{_esc(website)}\" target=\"_blank\">{_esc(website)}</a></li>")
    if linkedin_url: contact.append(f"<li><strong>LinkedIn:</strong> <a href=\"{_esc(linkedin_url)}\" target=\"_blank\">{_esc(linkedin_url)}</a></li>")
    if contact:
        parts.append("<h3>Kontakt</h3>")
        parts.append(f"<ul>{''.join(contact)}</ul>")

    if message and message.strip():
        parts.append("<h3>Nachricht</h3>")
        parts.append(f"<blockquote>{_esc(message).replace(chr(10), '<br>')}</blockquote>")

    if quiz is not None:
        parts.append("<h3>Freiheitstest</h3>")
        q = []
        score = quiz if isinstance(quiz, (int, float)) else quiz.get("score") if isinstance(quiz, dict) else None
        if score is not None:
            q.append(f"<li><strong>Score:</strong> {int(score)}%</li>")
        pillars = top_pillars if top_pillars else (quiz.get("top_pillars") if isinstance(quiz, dict) else None)
        if pillars:
            pillar_labels = {"operations": "Operations & Führung", "systeme": "Systeme & Automatisierung", "ki": "KI-Readiness"}
            labels = [pillar_labels.get(p, p) for p in pillars]
            q.append(f"<li><strong>Top-Handlungsbedarf:</strong> {_esc(', '.join(labels))}</li>")
        parts.append(f"<ul>{''.join(q)}</ul>")

    if executive_summary:
        parts.append("<h3>Analyse</h3>")
        parts.append(f"<p>{_esc(executive_summary)}</p>")

    if profile_lines:
        rows = "".join(
            f"<li><strong>{_esc(p[0])}:</strong> {_esc(p[1])}</li>"
            for p in profile_lines if len(p) >= 2
        )
        if rows:
            parts.append("<h3>Profil</h3>")
            parts.append(f"<ul>{rows}</ul>")

    if org_fields:
        firmen_rows = []
        if org_fields.get("address_street") or org_fields.get("address_city"):
            addr = " ".join(filter(None, [
                org_fields.get("address_street"),
                org_fields.get("address_zip"),
                org_fields.get("address_city"),
                org_fields.get("address_country"),
            ]))
            if addr.strip():
                firmen_rows.append(f"<li><strong>Adresse:</strong> {_esc(addr)}</li>")
        if org_fields.get("legal_form"):       firmen_rows.append(f"<li><strong>Rechtsform:</strong> {_esc(org_fields['legal_form'])}</li>")
        if org_fields.get("register_number"):  firmen_rows.append(f"<li><strong>HRB:</strong> {_esc(org_fields['register_number'])}</li>")
        if org_fields.get("register_court"):   firmen_rows.append(f"<li><strong>Registergericht:</strong> {_esc(org_fields['register_court'])}</li>")
        if org_fields.get("ceo_name"):         firmen_rows.append(f"<li><strong>{_esc(org_fields.get('ceo_position') or 'Geschäftsführung')}:</strong> {_esc(org_fields['ceo_name'])}</li>")
        if org_fields.get("employee_count"):   firmen_rows.append(f"<li><strong>Mitarbeiter:</strong> {_esc(org_fields['employee_count'])}</li>")
        if org_fields.get("founding_year"):    firmen_rows.append(f"<li><strong>Gegründet:</strong> {_esc(org_fields['founding_year'])}</li>")
        if firmen_rows:
            parts.append("<h3>Firmendaten (auto-enriched)</h3>")
            parts.append(f"<ul>{''.join(firmen_rows)}</ul>")

    fd = form_data or {}
    utm_keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "referrer", "landingPage"]
    if any(fd.get(k) for k in utm_keys):
        parts.append("<h3>Tracking</h3>")
        utm_rows = "".join(
            f"<li><strong>{_esc(k)}:</strong> {_esc(fd[k])}</li>"
            for k in utm_keys if fd.get(k)
        )
        parts.append(f"<ul>{utm_rows}</ul>")

    if fd.get("actionCode"):
        parts.append(f"<p><strong>Aktionscode:</strong> {_esc(fd['actionCode'])}</p>")

    return "\n".join(parts)


def _build_sales_title(email, source, name=None, company=None):
    suffix = source
    if suffix.startswith("website-"):  suffix = suffix[len("website-"):]
    if suffix.startswith("linkedin-"): suffix = "LI-" + suffix[len("linkedin-"):]
    if suffix.startswith("botdog-"):   suffix = "BD-" + suffix[len("botdog-"):]

    if name and company:
        return f"{name}, {company} — {suffix}"
    if name:
        return f"{name} — {suffix}"
    if company:
        return f"{company} — {suffix}"
    return f"{email} — {suffix}"


def create_sales_ticket(email, source, name=None, company=None, position=None,
                         phone=None, website=None, linkedin_url=None,
                         message=None, quiz=None, top_pillars=None,
                         executive_summary=None, profile_lines=None,
                         org_fields=None, form_data=None):
    """Create one ticket in the centralized SALES project (EBNER workspace).

    Replaces the old create_leadtime_lead() org+person+project logic. All lead
    data lives in the ticket description. Source differentiation via tag.
    """
    if not LEADTIME_TOKEN:
        log("  ⚠ LEADTIME_EBNER_PAT not set – skipping SALES ticket")
        return None

    src = normalize_source(source)
    title = _build_sales_title(email, src, name=name, company=company)
    description = _build_sales_description(
        email, src, name=name, company=company, position=position,
        phone=phone, website=website, linkedin_url=linkedin_url,
        message=message, quiz=quiz, top_pillars=top_pillars,
        executive_summary=executive_summary, profile_lines=profile_lines,
        org_fields=org_fields, form_data=form_data,
    )
    priority = "High" if src == "website-erstgespraech" else "Normal"

    payload = {
        "title": title,
        "projectId": SALES["projectId"],
        "typeId": SALES["typeId"],
        "statusId": SALES["statusNeu"],
        "priority": priority,
        "assignedToId": SALES["lukasUserId"],
        "summary": SOURCE_LABELS.get(src, src),
        "estimatedTime": 30,
        "description": description,
        "tags": [SOURCE_TAGS[src]],
    }

    try:
        result = lt_post("/tasks", payload)
        sn = result.get("shortNumber") if isinstance(result, dict) else None
        log(f"  → SALES-{sn} created · {email} · {src}")
        return result
    except Exception as e:
        log(f"  ⚠ SALES ticket creation failed: {e}")
        return None


def create_leadtime_lead(email, company_name, quiz, domain, research, paper_data, form_data=None, chat_context=None):
    """Backward-compat wrapper. Delegates to create_sales_ticket().

    If chat_context is set (KI-Readiness chatbot path), source=website-chatbot.
    Otherwise the source is website-freiheitstest (regular quiz path).
    """
    if not LEADTIME_TOKEN:
        log("  ⚠ LEADTIME_EBNER_PAT not set – skipping")
        return

    # Extract structured fields from research (kept — used inside the description now)
    org_fields = extract_org_fields_from_research(research, paper_data or {})
    log(f"  → Extracted org fields: street={org_fields['address_street']}, city={org_fields['address_city']}, phone={org_fields['phone']}, legal={org_fields['legal_form']}, ceo={org_fields['ceo_name']}")

    contact_name = (paper_data or {}).get("contact_name")
    src = "website-chatbot" if chat_context else "website-freiheitstest"

    # If chatbot, include the conversation summary in the message field
    msg = (form_data or {}).get("message")
    if chat_context and not msg:
        msg = f"[Chat-Verlauf]\n{chat_context}"

    create_sales_ticket(
        email=email,
        source=src,
        name=contact_name,
        company=company_name if company_name and company_name.strip() else None,
        phone=org_fields.get("phone"),
        website=f"https://{domain}" if domain else None,
        message=msg,
        quiz=quiz,
        executive_summary=(paper_data or {}).get("executive_summary"),
        profile_lines=(paper_data or {}).get("profile_lines"),
        org_fields=org_fields,
        form_data=form_data,
    )
    return



# ══════════════════════════════════════════════════════════
#  MAIN PIPELINE
# ══════════════════════════════════════════════════════════

def log(msg: str):
    print(msg, flush=True)


def run_pipeline(email: str, quiz: dict, send_email: bool = True, chat_context: str = None, form_data: dict = None) -> dict:
    """
    Full pipeline: Research → Analysis → PDF → Code → Email

    Returns dict with: pdf_path, action_code, company_name, email_sent
    """
    started = datetime.now()
    log(f"\n{'='*60}")
    log(f"  STRATEGY PAPER PIPELINE")
    log(f"  Email: {email}")
    log(f"  Score: {quiz['score']}%")
    log(f"{'='*60}\n")

    domain = extract_domain(email)
    deadline_date = datetime.now() + timedelta(days=30)
    deadline_display = deadline_date.strftime("%d.%m.%Y")
    deadline_iso = deadline_date.isoformat()

    # ── Step 1: Research ──
    research = None
    if domain:
        log("── STEP 1: Deep Research ──")
        research = deep_research(domain)
        log(f"  ✓ Research complete ({len(research)} chars)\n")
    else:
        log("── STEP 1: Freemail → Skip research ──\n")

    # ── Step 2: AI Analysis ──
    log("── STEP 2: AI Analysis (Claude Sonnet) ──")
    paper_data = generate_structured_paper(email, quiz, domain, research, chat_context)
    company_name = paper_data.get("company_name") or ""
    log(f"  ✓ Analysis complete (company: {company_name or 'n/a'})\n")

    # ── Step 2b: Leadtime CRM ──
    log("── STEP 2b: Leadtime CRM ──")
    try:
        create_leadtime_lead(email, company_name, quiz, domain, research, paper_data, form_data, chat_context=chat_context)
        log(f"  ✓ Lead created in Leadtime\n")
    except Exception as e:
        log(f"  ⚠ Leadtime failed (non-blocking): {e}\n")

    # ── Step 3: Action Code ──
    log("── STEP 3: Action Code ──")
    code = generate_action_code(company_name, email)
    register_code_locally(code, email, company_name, deadline_iso)

    # ── Step 4: Build PDF data + generate ──
    log("\n── STEP 4: PDF Generation ──")

    # German date
    months_de = {1:"Januar",2:"Februar",3:"März",4:"April",5:"Mai",6:"Juni",
                 7:"Juli",8:"August",9:"September",10:"Oktober",11:"November",12:"Dezember"}
    now = datetime.now()
    date_de = f"{now.day}. {months_de[now.month]} {now.year}"

    pdf_data = {
        "company_name": company_name or None,
        "contact_name": paper_data.get("contact_name"),
        "date": date_de,
        "score": quiz["score"],
        "pillar_scores": quiz["pillar_scores"],
        "profile_lines": [tuple(p) for p in paper_data.get("profile_lines", [])],
        "executive_summary": paper_data.get("executive_summary", ""),
        "personal_cta_text": paper_data.get("personal_cta_text"),
        "sections": paper_data.get("sections", []),
        "action_code": code,
        "cta_deadline": deadline_display,
    }

    slug = domain.split(".")[0] if domain else f"personal-{email.split('@')[0]}"
    pdf_filename = f"strategy-paper-{slug}-{now.strftime('%Y%m%d')}.pdf"
    pdf_path = str(OUTPUT_DIR / pdf_filename)

    generate_pdf(pdf_data, pdf_path)

    # ── Step 5: Send Email ──
    email_sent = False
    if send_email:
        log("\n── STEP 5: Email via Resend ──")
        email_sent = send_paper_email(email, company_name, pdf_path, code, deadline_display)
    else:
        log("\n── STEP 5: Email skipped (send_email=False) ──")

    # ── Done ──
    elapsed = (datetime.now() - started).total_seconds()
    log(f"\n{'='*60}")
    log(f"  ✓ PIPELINE COMPLETE in {elapsed:.1f}s")
    log(f"  PDF:    {pdf_path}")
    log(f"  Code:   {code}")
    log(f"  Email:  {'sent' if email_sent else 'not sent'}")
    log(f"{'='*60}\n")

    return {
        "pdf_path": pdf_path,
        "pdf_filename": pdf_filename,
        "action_code": code,
        "company_name": company_name,
        "email_sent": email_sent,
        "deadline": deadline_iso,
        "elapsed_seconds": elapsed,
    }


# ══════════════════════════════════════════════════════════
#  ENRICH-ONLY MODE (for ebook / contact form leads)
# ══════════════════════════════════════════════════════════

def run_enrich(email: str, source: str = "ebook", form_data: dict = None) -> dict:
    """
    Lightweight pipeline: Research → Leadtime CRM (no AI analysis, no PDF, no email).
    Used for ebook downloads and contact form leads to enrich Leadtime with crawled data.
    form_data: optional dict with keys like name, company, message, actionCode from the form.
    """
    form_data = form_data or {}
    started = datetime.now()
    log(f"\n{'='*60}")
    log(f"  ENRICH PIPELINE ({source})")
    log(f"  Email: {email}")
    log(f"{'='*60}\n")

    domain = extract_domain(email)

    if not domain:
        log("── Freemail → SALES ticket without enrichment ──")
        create_sales_ticket(
            email=email,
            source=source,
            name=form_data.get("name"),
            company=form_data.get("company"),
            message=form_data.get("message"),
            form_data=form_data,
        )
        elapsed = (datetime.now() - started).total_seconds()
        return {"email": email, "source": source, "domain": None, "elapsed_seconds": elapsed}

    # ── Step 1: Research ──
    log("── STEP 1: Deep Research ──")
    research = deep_research(domain)
    log(f"  ✓ Research complete ({len(research)} chars)\n")

    # ── Step 2: Extract company name from research (lightweight, no Claude) ──
    company_name = domain.split(".")[0].capitalize()
    # Try to find proper company name in research
    name_patterns = [
        re.search(r'(?:Firmenname|Firma|Unternehmen|Company)[:\s]*([A-ZÄÖÜ][\w\s&.]+(?:GmbH|UG|AG|e\.K\.|OHG|KG|SE|Ltd\.|Inc\.))', research),
        re.search(r'([\w\s&.]+(?:GmbH|UG|AG|SE))', research),
    ]
    for m in name_patterns:
        if m:
            company_name = m.group(1).strip()
            break
    log(f"  Company: {company_name}")

    # ── Step 3: Extract org fields from research ──
    org_fields = extract_org_fields_from_research(research, {})
    log(f"  → Fields: street={org_fields['address_street']}, city={org_fields['address_city']}, phone={org_fields['phone']}, legal={org_fields['legal_form']}")

    # ── Step 4: Create SALES ticket ──
    log("── STEP 2: SALES ticket ──")
    contact_name = form_data.get("name") or resolve_contact_name(email, research)
    create_sales_ticket(
        email=email,
        source=source,
        name=contact_name,
        company=company_name,
        phone=org_fields.get("phone"),
        website=f"https://{domain}" if domain else None,
        message=form_data.get("message"),
        org_fields=org_fields,
        form_data=form_data,
    )

    elapsed = (datetime.now() - started).total_seconds()
    log(f"\n{'='*60}")
    log(f"  ✓ ENRICH COMPLETE in {elapsed:.1f}s")
    log(f"{'='*60}\n")

    return {"email": email, "source": source, "domain": domain, "company": company_name, "elapsed_seconds": elapsed}


# ── Sample quiz data for testing ──
SAMPLE_QUIZ = {
    "score": 38,
    "answers": {
        "ops_1": {"q": "Dein Unternehmen läuft ohne dich.", "a": 2, "label": "Noch nicht"},
        "ops_2": {"q": "Jede Rolle ist ersetzbar – auch deine.", "a": 3, "label": "Dringend nötig"},
        "ops_3": {"q": "Du arbeitest am Unternehmen, nicht im Unternehmen.", "a": 2, "label": "Noch nicht"},
        "sys_1": {"q": "Alles an einem Ort, nichts im Kopf.", "a": 2, "label": "Noch nicht"},
        "sys_2": {"q": "Du siehst auf einen Blick, wo dein Unternehmen steht.", "a": 3, "label": "Dringend nötig"},
        "sys_3": {"q": "Wiederkehrende Abläufe laufen automatisch.", "a": 2, "label": "Noch nicht"},
        "ki_1": {"q": "Dein Unternehmen hat eine KI-Strategie.", "a": 3, "label": "Dringend nötig"},
        "ki_2": {"q": "Dein Team nutzt KI im Arbeitsalltag.", "a": 2, "label": "Noch nicht"},
        "ki_3": {"q": "KI verschafft dir einen echten Wettbewerbsvorteil.", "a": 3, "label": "Dringend nötig"},
    },
    "pillar_scores": {"operations": 18, "systeme": 22, "ki": 12},
    "top_pillars": ["ki", "systeme", "operations"]
}


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        # Test without email
        result = run_pipeline("info@fracto.de", SAMPLE_QUIZ, send_email=False)
        print(json.dumps(result, indent=2))

    elif len(sys.argv) > 1 and sys.argv[1] == "--test-email":
        # Test WITH email delivery
        result = run_pipeline("info@fracto.de", SAMPLE_QUIZ, send_email=True)
        print(json.dumps(result, indent=2))

    elif len(sys.argv) > 1 and sys.argv[1] == "--enrich":
        # Enrich-only mode: Research → Leadtime CRM (no PDF/email)
        # Input: {"email": "...", "source": "ebook|erstgespraech|contact", "formData": {...}}
        input_data = json.loads(sys.argv[2])
        result = run_enrich(input_data["email"], input_data.get("source", "ebook"), input_data.get("formData"))
        print(json.dumps(result, indent=2))

    elif len(sys.argv) > 1 and sys.argv[1].startswith("{"):
        # JSON input: {"email": "...", "quiz": {...}, "chat_context": "..."}
        input_data = json.loads(sys.argv[1])
        result = run_pipeline(
            input_data["email"],
            input_data["quiz"],
            chat_context=input_data.get("chat_context"),
            form_data=input_data.get("formData"),
        )
        print(json.dumps(result, indent=2))

    else:
        print("Usage:")
        print("  python strategy-pipeline.py --test          # Dry run (no email)")
        print("  python strategy-pipeline.py --test-email    # Full test with email")
        print("  python strategy-pipeline.py --enrich '{...}'  # Enrich-only (research + CRM)")
        print('  python strategy-pipeline.py \'{"email":"...","quiz":{...}}\'')
