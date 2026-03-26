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
        ("HANDELSREGISTER", f"\"{company}\" handelsregister OR gründung OR gesellschafter", "search", 3),
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

    # If we have research data, try to verify the name appears there
    if research and candidate_first:
        # Search for the name in research to confirm it's a real person
        if candidate_last and candidate_last.lower() in research.lower():
            return candidate_first
        if candidate_first.lower() in research.lower():
            return candidate_first
        # Name not found in research – might still be the person,
        # but we only return it if the local part has a clear name pattern
        if candidate_last and len(candidate_first) > 2 and len(candidate_last) > 2:
            return candidate_first

    # Without research, only return if clearly a name pattern (vorname.nachname)
    if not research and candidate_last and len(candidate_first) > 2 and len(candidate_last) > 2:
        return candidate_first

    return None


def generate_structured_paper(email: str, quiz: dict, domain: str = None, research: str = None) -> dict:
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
LEADTIME_TOKEN = os.environ.get("LEADTIME_API_TOKEN", "")

LT_CONFIG = {
    "ticketProjectId": "8b72205b-dedf-48a2-8353-d55253eb10d4",
    "ticketTypeId": "327b0253-13df-4228-9a7b-bedbf17040b3",
    "ticketStatusId": "e30a42cf-d211-4212-a62c-7138233dabb4",
    "emailFieldId": "81531748-6222-4b9b-b805-adbbb85d759d",
    "categoryId": "c60944bb-4df2-467d-ad0b-9f5987e04601",
    "projectStatusId": "b6a95701-ba1b-47a6-a5de-4b246b2e0384",
    "userId": "268573a4-bee0-405c-bfdb-c5b6dec1970f",
    "taskTypes": [
        "e4a3c02e-13fe-455d-97fb-98f0c11a5353",
        "fe079aaf-733b-46d9-a2fd-b66b1b00d0c4",
        "327b0253-13df-4228-9a7b-bedbf17040b3",
    ],
    "activities": [
        "2280594c-641e-4fe5-b9cf-f887eef79898",
        "80aaec6a-bb92-40d6-b6c3-7164f96e6bb3",
        "bd16786a-8a0a-4efe-9f97-056b3916a622",
        "f5347885-ff76-43b7-9f0f-a276035933ff",
    ],
    "guestRoleId": "KQPRXN_guest_",
}


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


def create_leadtime_lead(email, company_name, quiz, domain, research, paper_data):
    """Create organization + member + project in Leadtime CRM with enriched data."""
    if not LEADTIME_TOKEN:
        log("  ⚠ LEADTIME_API_TOKEN not set – skipping")
        return

    pillar_labels = {"operations": "Operations & Führung", "systeme": "Systeme & Automatisierung", "ki": "KI-Readiness"}
    now_str = datetime.now().strftime("%d.%m.%Y")

    # Extract structured fields from research
    org_fields = extract_org_fields_from_research(research, paper_data)
    log(f"  → Extracted org fields: street={org_fields['address_street']}, city={org_fields['address_city']}, phone={org_fields['phone']}, email={org_fields['email']}, legal={org_fields['legal_form']}, ceo={org_fields['ceo_name']}")

    # Build description with all available data
    desc = [f"<p><strong>Quelle:</strong> Freiheitstest ({now_str})</p>"]
    desc.append(f"<p><strong>E-Mail:</strong> {email}</p>")
    contact_name = paper_data.get("contact_name")
    if contact_name:
        desc.append(f"<p><strong>Name:</strong> {contact_name}</p>")
    desc.append(f"<p><strong>Freiheitsgrad:</strong> {quiz['score']}%</p>")
    top_pillars = quiz.get("top_pillars", [])
    if top_pillars:
        labels = [pillar_labels.get(p, p) for p in top_pillars]
        desc.append(f"<p><strong>Handlungsbedarf:</strong> {', '.join(labels)}</p>")
    # Add executive summary from analysis
    summary = paper_data.get("executive_summary", "")
    if summary:
        desc.append(f"<p><strong>Analyse:</strong> {summary}</p>")
    # Add profile lines (enriched data)
    profile = paper_data.get("profile_lines", [])
    if profile:
        profile_html = "".join(f"<li>{p[0]}: {p[1]}</li>" for p in profile if len(p) >= 2)
        desc.append(f"<p><strong>Profil:</strong></p><ul>{profile_html}</ul>")

    has_company = bool(company_name and company_name.strip())

    if not has_company and domain:
        # Use domain as company name fallback
        company_name = domain.split(".")[0]
        has_company = True

    if has_company:
        # ── Full lead: Org + Member + Project ──
        # 1. Find or create organization
        orgs_data = lt_get("/organizations?pageSize=100&page=1")
        items = orgs_data.get("items", orgs_data.get("data", orgs_data if isinstance(orgs_data, list) else []))
        comp_lower = company_name.lower()
        existing = next((o for o in items if comp_lower in o["name"].lower() or o["name"].lower() in comp_lower), None)

        # Build full address
        addr_street = org_fields["address_street"]
        addr_zip = org_fields["address_zip"]
        addr_city = org_fields["address_city"]

        if existing:
            org_id = existing["id"]
            log(f"  → Org exists: {existing['name']} ({org_id})")
            # Patch with enriched data if fields were empty
            patch_data = {}
            if addr_street:
                patch_data["addressStreet"] = addr_street
            if addr_zip:
                patch_data["addressZip"] = addr_zip
            if addr_city:
                patch_data["addressCity"] = addr_city
            if org_fields["phone"]:
                patch_data["phone"] = org_fields["phone"]
            if org_fields["email"]:
                patch_data["email"] = org_fields["email"]
            if org_fields["legal_form"]:
                patch_data["legalForm"] = org_fields["legal_form"]
            if org_fields["register_number"]:
                patch_data["registrationNumber"] = org_fields["register_number"]
            if org_fields["register_court"]:
                patch_data["registrationCourt"] = org_fields["register_court"]
            if patch_data:
                try:
                    lt_patch(f"/organizations/{org_id}", patch_data)
                    log(f"  → Org enriched with: {', '.join(patch_data.keys())}")
                except Exception as e:
                    log(f"  → Org patch failed (non-blocking): {e}")
        else:
            website = f"https://{domain}" if domain else ""
            org_payload = {
                "name": company_name,
                "type": "Prospect",
                "color": "#F44900",
                "website": website,
                "addressCountry": org_fields["address_country"],
            }
            if addr_street:
                org_payload["addressStreet"] = addr_street
            if addr_zip:
                org_payload["addressZip"] = addr_zip
            if addr_city:
                org_payload["addressCity"] = addr_city
            if org_fields["phone"]:
                org_payload["phone"] = org_fields["phone"]
            if org_fields["email"]:
                org_payload["email"] = org_fields["email"]
            if org_fields["legal_form"]:
                org_payload["legalForm"] = org_fields["legal_form"]
            if org_fields["register_number"]:
                org_payload["registrationNumber"] = org_fields["register_number"]
            if org_fields["register_court"]:
                org_payload["registrationCourt"] = org_fields["register_court"]

            org = lt_post("/organizations", org_payload)
            org_id = org["id"]
            log(f"  → Org created: {company_name} ({org_id})")

        # 2. Create member – use contact_name + enrich with CEO data from research
        first_name = "-"
        last_name = "-"
        position = ""
        ceo_parts = org_fields["ceo_name"].strip().split() if org_fields["ceo_name"] else []

        if contact_name:
            parts = contact_name.strip().split()
            first_name = parts[0]
            if len(parts) > 1:
                last_name = parts[-1]
            elif ceo_parts and len(ceo_parts) >= 2 and ceo_parts[0].lower() == first_name.lower():
                # contact_name is just "Lukas", CEO is "Lukas Ebner" → use Ebner
                last_name = ceo_parts[-1]
                position = org_fields["ceo_position"] or "Geschäftsführer"
            else:
                last_name = "-"
        elif ceo_parts:
            first_name = ceo_parts[0]
            last_name = ceo_parts[-1] if len(ceo_parts) > 1 else "-"
            position = org_fields["ceo_position"] or "Geschäftsführer"

        try:
            lt_post("/organizations/members", {
                "organizationId": org_id,
                "firstName": first_name,
                "lastName": last_name,
                "email": email,
                "position": position,
                "phone": org_fields["phone"],
                "roleId": LT_CONFIG["guestRoleId"],
                "isActive": True,
                "canLogin": False,
            })
            log(f"  → Member created: {first_name} {last_name}")
        except Exception:
            log(f"  → Member exists or creation skipped")

        # 3. Create project (sales opportunity)
        proj = lt_post("/projects", {
            "name": f"{company_name} – Freiheitstest",
            "type": "Support",
            "valueGroup": "DirectValue",
            "categoryId": LT_CONFIG["categoryId"],
            "statusId": LT_CONFIG["projectStatusId"],
            "phaseId": None,
            "organizationId": org_id,
            "description": "\n".join(desc),
            "guestAccess": False,
            "users": [LT_CONFIG["userId"]],
            "teams": [],
            "taskTypes": LT_CONFIG["taskTypes"],
            "activities": LT_CONFIG["activities"],
            "customFields": {},
        })
        log(f"  → Project created: {proj.get('shortName', '?')} – {proj.get('name', '?')}")

    else:
        # ── Freemail fallback: just a ticket ──
        lt_post("/tasks", {
            "title": f"Freiheitstest: {email}",
            "projectId": LT_CONFIG["ticketProjectId"],
            "typeId": LT_CONFIG["ticketTypeId"],
            "statusId": LT_CONFIG["ticketStatusId"],
            "priority": "Normal",
            "summary": f"Freiheitstest von {email}",
            "estimatedTime": 1,
            "description": "\n".join(desc),
            "customFields": [{"fieldId": LT_CONFIG["emailFieldId"], "value": email}],
        })
        log(f"  → Ticket created in INT-1")


# ══════════════════════════════════════════════════════════
#  MAIN PIPELINE
# ══════════════════════════════════════════════════════════

def log(msg: str):
    print(msg, flush=True)


def run_pipeline(email: str, quiz: dict, send_email: bool = True) -> dict:
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
    paper_data = generate_structured_paper(email, quiz, domain, research)
    company_name = paper_data.get("company_name") or ""
    log(f"  ✓ Analysis complete (company: {company_name or 'n/a'})\n")

    # ── Step 2b: Leadtime CRM ──
    log("── STEP 2b: Leadtime CRM ──")
    try:
        create_leadtime_lead(email, company_name, quiz, domain, research, paper_data)
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
        log("── Freemail → creating ticket only ──")
        # Create a simple ticket for freemail addresses
        try:
            source_label = {"ebook": "Ebook-Download", "erstgespraech": "Erstgespräch", "contact": "Kontaktanfrage"}.get(source, source)
            now_str = datetime.now().strftime("%d.%m.%Y")
            desc = [
                f"<p><strong>Quelle:</strong> {source_label} ({now_str})</p>",
                f"<p><strong>E-Mail:</strong> {email}</p>",
            ]
            if form_data.get("name"):
                desc.append(f"<p><strong>Name:</strong> {form_data['name']}</p>")
            if form_data.get("company"):
                desc.append(f"<p><strong>Unternehmen:</strong> {form_data['company']}</p>")
            if form_data.get("message"):
                msg_html = form_data["message"].replace("\n", "<br/>")
                desc.append(f"<p><strong>Formulardaten:</strong><br/>{msg_html}</p>")
            if form_data.get("actionCode"):
                desc.append(f"<p><strong>Aktionscode:</strong> {form_data['actionCode']}</p>")
            if LEADTIME_TOKEN:
                lt_post("/tasks", {
                    "title": f"{source_label}: {email}",
                    "projectId": LT_CONFIG["ticketProjectId"],
                    "typeId": LT_CONFIG["ticketTypeId"],
                    "statusId": LT_CONFIG["ticketStatusId"],
                    "priority": "Normal",
                    "summary": f"{source_label} von {email}",
                    "estimatedTime": 1,
                    "description": "\n".join(desc),
                    "customFields": [{"fieldId": LT_CONFIG["emailFieldId"], "value": email}],
                })
                log(f"  → Ticket created in INT-1")
        except Exception as e:
            log(f"  ⚠ Ticket creation failed: {e}")

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

    # ── Step 4: Create Leadtime lead ──
    log("── STEP 2: Leadtime CRM ──")
    source_label = {"ebook": "Ebook-Download", "erstgespraech": "Erstgespräch", "contact": "Kontaktanfrage"}.get(source, source)
    now_str = datetime.now().strftime("%d.%m.%Y")

    if LEADTIME_TOKEN:
        try:
            # Build description with all form data
            desc = [
                f"<p><strong>Quelle:</strong> {source_label} ({now_str})</p>",
                f"<p><strong>E-Mail:</strong> {email}</p>",
            ]
            if form_data.get("name"):
                desc.append(f"<p><strong>Name:</strong> {form_data['name']}</p>")
            if form_data.get("company"):
                desc.append(f"<p><strong>Unternehmen:</strong> {form_data['company']}</p>")
            if form_data.get("message"):
                msg_html = form_data["message"].replace("\n", "<br/>")
                desc.append(f"<p><strong>Formulardaten:</strong><br/>{msg_html}</p>")
            if form_data.get("actionCode"):
                desc.append(f"<p><strong>Aktionscode:</strong> {form_data['actionCode']}</p>")

            # Find or create org
            orgs_data = lt_get("/organizations?pageSize=100&page=1")
            items = orgs_data.get("items", orgs_data.get("data", orgs_data if isinstance(orgs_data, list) else []))
            comp_lower = company_name.lower()
            existing = next((o for o in items if comp_lower in o["name"].lower() or o["name"].lower() in comp_lower), None)

            org_payload_fields = {}
            if org_fields["address_street"]:
                org_payload_fields["addressStreet"] = org_fields["address_street"]
            if org_fields["address_zip"]:
                org_payload_fields["addressZip"] = org_fields["address_zip"]
            if org_fields["address_city"]:
                org_payload_fields["addressCity"] = org_fields["address_city"]
            if org_fields["phone"]:
                org_payload_fields["phone"] = org_fields["phone"]
            if org_fields["email"]:
                org_payload_fields["email"] = org_fields["email"]
            if org_fields["legal_form"]:
                org_payload_fields["legalForm"] = org_fields["legal_form"]
            if org_fields["register_number"]:
                org_payload_fields["registrationNumber"] = org_fields["register_number"]
            if org_fields["register_court"]:
                org_payload_fields["registrationCourt"] = org_fields["register_court"]

            if existing:
                org_id = existing["id"]
                log(f"  → Org exists: {existing['name']} ({org_id})")
                if org_payload_fields:
                    try:
                        lt_patch(f"/organizations/{org_id}", org_payload_fields)
                        log(f"  → Org enriched with: {', '.join(org_payload_fields.keys())}")
                    except Exception as e:
                        log(f"  → Org patch failed: {e}")
            else:
                org = lt_post("/organizations", {
                    "name": company_name,
                    "type": "Prospect",
                    "color": "#F44900",
                    "website": f"https://{domain}",
                    "addressCountry": "Deutschland",
                    **org_payload_fields,
                })
                org_id = org["id"]
                log(f"  → Org created: {company_name} ({org_id})")

            # Create member — prefer form name over email-guessed name
            contact_name = form_data.get("name") or resolve_contact_name(email, research)
            first_name = "-"
            last_name = "-"
            position = ""
            ceo_parts = org_fields["ceo_name"].strip().split() if org_fields["ceo_name"] else []

            if contact_name:
                parts = contact_name.strip().split()
                first_name = parts[0]
                if len(parts) > 1:
                    last_name = parts[-1]
                elif ceo_parts and len(ceo_parts) >= 2 and ceo_parts[0].lower() == first_name.lower():
                    last_name = ceo_parts[-1]
                    position = org_fields["ceo_position"] or "Geschäftsführer"
            elif ceo_parts:
                first_name = ceo_parts[0]
                last_name = ceo_parts[-1] if len(ceo_parts) > 1 else "-"
                position = org_fields["ceo_position"] or "Geschäftsführer"

            try:
                lt_post("/organizations/members", {
                    "organizationId": org_id,
                    "firstName": first_name,
                    "lastName": last_name,
                    "email": email,
                    "position": position,
                    "phone": org_fields.get("phone", ""),
                    "roleId": LT_CONFIG["guestRoleId"],
                    "isActive": True,
                    "canLogin": False,
                })
                log(f"  → Member created: {first_name} {last_name}")
            except Exception:
                log(f"  → Member exists or creation skipped")

            # Create project
            proj = lt_post("/projects", {
                "name": f"{company_name} – {source_label}",
                "type": "Support",
                "valueGroup": "DirectValue",
                "categoryId": LT_CONFIG["categoryId"],
                "statusId": LT_CONFIG["projectStatusId"],
                "phaseId": None,
                "organizationId": org_id,
                "description": "\n".join(desc),
                "guestAccess": False,
                "users": [LT_CONFIG["userId"]],
                "teams": [],
                "taskTypes": LT_CONFIG["taskTypes"],
                "activities": LT_CONFIG["activities"],
                "customFields": {},
            })
            log(f"  → Project created: {proj.get('shortName', '?')} – {proj.get('name', '?')}")

        except Exception as e:
            log(f"  ⚠ Leadtime failed: {e}")
    else:
        log("  ⚠ LEADTIME_API_TOKEN not set – skipping")

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
        # JSON input: {"email": "...", "quiz": {...}}
        input_data = json.loads(sys.argv[1])
        result = run_pipeline(input_data["email"], input_data["quiz"])
        print(json.dumps(result, indent=2))

    else:
        print("Usage:")
        print("  python strategy-pipeline.py --test          # Dry run (no email)")
        print("  python strategy-pipeline.py --test-email    # Full test with email")
        print("  python strategy-pipeline.py --enrich '{...}'  # Enrich-only (research + CRM)")
        print('  python strategy-pipeline.py \'{"email":"...","quiz":{...}}\'')
