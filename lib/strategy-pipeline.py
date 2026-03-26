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
import requests
from datetime import datetime, timedelta
from pathlib import Path

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
    r = requests.post(url, json=payload, headers=headers, timeout=15)
    r.raise_for_status()
    return r.json()


def scrape_and_extract(url: str) -> str:
    """Crawl page via Serper Scrape, extract facts via Haiku."""
    headers = {"X-API-KEY": SERPER_KEY, "Content-Type": "application/json"}
    try:
        r = requests.post("https://scrape.serper.dev", json={"url": url}, headers=headers, timeout=20)
        r.raise_for_status()
        page_text = r.json().get("text", "")[:8000]
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
        r = requests.post("https://api.anthropic.com/v1/messages", json=payload, headers=api_headers, timeout=30)
        r.raise_for_status()
        return r.json()["content"][0]["text"]
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
        lines.append(f"  [{pillar}] \"{item['q']}\" → {item['label']} ({item['a']}/3)")
    return "\n".join(lines)


def resolve_contact_name(email: str, research: str = None) -> str | None:
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
    headers = {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    payload = {
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 6000,
        "messages": [{"role": "user", "content": prompt}]
    }
    r = requests.post("https://api.anthropic.com/v1/messages", json=payload, headers=headers, timeout=90)
    r.raise_for_status()
    return r.json()["content"][0]["text"]


# ══════════════════════════════════════════════════════════
#  STEP 3: PDF GENERATION
# ══════════════════════════════════════════════════════════

def generate_pdf(data: dict, output_path: str):
    """Import and run the PDF generator."""
    # Add the directory containing generate_pdf.py to path
    pdf_script = Path(__file__).resolve().parent.parent.parent / "generate_pdf.py"
    if not pdf_script.exists():
        # Fallback: check working directory
        pdf_script = Path("/sessions/practical-tender-faraday/generate_pdf.py")

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
    """Send the strategy paper PDF via Resend."""
    if not RESEND_KEY:
        log("  ⚠ RESEND_API_KEY not set – skipping email")
        return False

    # Read PDF as base64
    with open(pdf_path, "rb") as f:
        pdf_b64 = base64.b64encode(f.read()).decode()

    company_ref = company_name or "dein Unternehmen"
    filename = f"Strategiepapier-{company_name or 'Persoenlich'}.pdf".replace(" ", "-")

    payload = {
        "from": "Lukas Ebner <lukas@lukasebner.de>",
        "to": [email],
        "subject": f"Dein persönliches Strategiepapier{' für ' + company_name if company_name else ''}",
        "html": f"""<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">

  <p style="font-size: 16px; line-height: 1.6;">Hi{' ' + company_ref if company_name else ''},</p>

  <p style="font-size: 16px; line-height: 1.6;">dein persönliches Strategiepapier ist fertig – basierend auf deinen Quiz-Ergebnissen{' und einer Analyse von ' + company_ref if company_name else ''}.</p>

  <p style="font-size: 16px; line-height: 1.6;">Im Anhang findest du eine detaillierte Auswertung mit konkreten Handlungsempfehlungen für die Bereiche Operations, Systeme und KI-Readiness.</p>

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
        "attachments": [
            {
                "filename": filename,
                "content": pdf_b64,
            }
        ]
    }

    try:
        r = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_KEY}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=30
        )
        r.raise_for_status()
        result = r.json()
        log(f"  ✓ Email sent to {email} (Resend ID: {result.get('id', '?')})")
        return True
    except Exception as e:
        log(f"  ✗ Email failed: {e}")
        if hasattr(e, 'response') and e.response is not None:
            log(f"    Response: {e.response.text}")
        return False


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

    elif len(sys.argv) > 1 and sys.argv[1].startswith("{"):
        # JSON input: {"email": "...", "quiz": {...}}
        input_data = json.loads(sys.argv[1])
        result = run_pipeline(input_data["email"], input_data["quiz"])
        print(json.dumps(result, indent=2))

    else:
        print("Usage:")
        print("  python strategy-pipeline.py --test          # Dry run (no email)")
        print("  python strategy-pipeline.py --test-email    # Full test with email")
        print('  python strategy-pipeline.py \'{"email":"...","quiz":{...}}\'')
