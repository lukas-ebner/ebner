#!/usr/bin/env python3
"""
Strategy Paper PDF Generator – fpdf2 (supports CFF/OTF fonts)
A4, custom fonts, cover page, gauge chart, branded layout
"""

import math
import os
import json
import hashlib
import subprocess
import sys
from datetime import datetime, timedelta

try:
    from fpdf import FPDF
except ImportError:
    # Auto-install fpdf2 – try multiple strategies for compatibility
    _installed = False
    for _pip_args in [
        [sys.executable, "-m", "pip", "install", "fpdf2", "--quiet", "--user"],
        [sys.executable, "-m", "pip", "install", "fpdf2", "--quiet", "--break-system-packages"],
        [sys.executable, "-m", "pip", "install", "fpdf2", "--quiet"],
    ]:
        try:
            subprocess.check_call(_pip_args)
            _installed = True
            break
        except (subprocess.CalledProcessError, FileNotFoundError):
            continue
    if not _installed:
        raise ImportError("fpdf2 konnte nicht installiert werden. Bitte manuell: pip3 install fpdf2")
    from fpdf import FPDF

# ── Paths (relative to project root) ──
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS_DIR = os.path.join(_PROJECT_ROOT, "public", "fonts")
ASSETS_DIR = os.path.join(_PROJECT_ROOT, "public", "images", "paper")
LOGO_PATH = os.path.join(ASSETS_DIR, "ebner-logo.svg")
LOGO_PNG = os.path.join(ASSETS_DIR, "ebner-logo.png")
TITLE_IMG = os.path.join(ASSETS_DIR, "title.jpg")
LUKAS_IMG = os.path.join(ASSETS_DIR, "lukas.jpg")
SIGNATURE_IMG = os.path.join(ASSETS_DIR, "unterschrift.png")

# ── Brand Colors ──
ORANGE = (244, 73, 0)
DARK_TEAL = (13, 80, 84)
DEEP_INDIGO = (27, 21, 100)
NAVY = (27, 42, 74)
LIGHT_BG = (245, 245, 240)
WARM_GRAY = (232, 229, 222)
TEXT_DARK = (26, 26, 26)
TEXT_MID = (74, 74, 74)
TEXT_LIGHT = (122, 122, 122)
WHITE = (255, 255, 255)
QUOTE_BG = (255, 243, 238)


def generate_action_code(company_name: str, email: str) -> str:
    """Generate a unique, deterministic action code from company + email."""
    seed = f"{company_name}:{email}:{datetime.now().strftime('%Y-%m')}".lower()
    short_hash = hashlib.sha256(seed.encode()).hexdigest()[:6].upper()
    prefix = company_name.split()[0].upper()[:8] if company_name else "STRATEGIE"
    return f"{prefix}-{short_hash}"


def register_action_code(code: str, email: str, company: str, deadline_iso: str, base_url: str = "https://lukasebner.de"):
    """Register the action code via the website API so it can be validated."""
    import urllib.request
    payload = json.dumps({
        "action": "create",
        "code": code,
        "email": email,
        "company": company,
        "deadline": deadline_iso,
    }).encode()
    req = urllib.request.Request(
        f"{base_url}/api/action-codes",
        data=payload,
        method="POST",
    )
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            if data.get("success"):
                print(f"  ✓ Action code {code} registered (deadline: {deadline_iso})")
            else:
                print(f"  ✗ Failed to register code: {data}")
    except Exception as e:
        print(f"  ⚠ Could not register action code (API unreachable): {e}")
        print(f"    → Code: {code}, Deadline: {deadline_iso}")
        print(f"    → You can manually add it to data/action-codes.json")


class StrategyPDF(FPDF):
    def __init__(self, data):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_left_margin(20)
        self.set_right_margin(20)
        self.set_auto_page_break(True, margin=25)
        self.data = data
        self.is_cover = True
        self._register_fonts()

    def _register_fonts(self):
        self.add_font("Degular", "", os.path.join(FONTS_DIR, "DegularDisplay-Regular.otf"))
        self.add_font("Degular", "B", os.path.join(FONTS_DIR, "DegularDisplay-Bold.otf"))
        self.add_font("Inter", "", os.path.join(FONTS_DIR, "InterDisplay-Regular.otf"))
        self.add_font("Inter", "B", os.path.join(FONTS_DIR, "InterDisplay-Bold.otf"))

    def header(self):
        if self.is_cover:
            return

        margin = 20

        # Logo top left
        try:
            self.image(LOGO_PNG, margin, 7, 22)
        except Exception:
            self.set_font("Degular", "B", 9)
            self.set_text_color(*TEXT_DARK)
            self.text(margin, 12, "ebner")

        # URL top right, aligned with line end
        self.set_font("Inter", "", 8)
        self.set_text_color(*TEXT_LIGHT)
        url_text = "lukasebner.de"
        url_w = self.get_string_width(url_text)
        self.text(self.w - margin - url_w, 12, url_text)

        # Thin line under header
        self.set_draw_color(*WARM_GRAY)
        self.set_line_width(0.15)
        self.line(margin, 16, self.w - margin, 16)

    def footer(self):
        if self.is_cover:
            return
        self.set_y(-15)
        self.set_font("Inter", "", 7)
        self.set_text_color(*TEXT_LIGHT)
        self.cell(0, 10, str(self.page_no()), align="C")

    # ── Drawing helpers ──

    def draw_gauge(self, x, y, score, radius=32):
        """Semi-circle gauge using small overlapping circles for smooth arcs."""
        cx = x + radius
        cy = y + radius
        thickness = 2.8
        steps = 300

        # Background arc (full 180°)
        self.set_fill_color(*WARM_GRAY)
        for i in range(steps + 1):
            angle = math.pi + (math.pi * i / steps)
            px = cx + radius * math.cos(angle)
            py = cy - radius * math.sin(angle)
            self.circle(px - thickness / 2, py - thickness / 2, thickness, style="F")

        # Score arc (orange, partial)
        self.set_fill_color(*ORANGE)
        score_steps = int(steps * score / 100)
        for i in range(score_steps + 1):
            angle = math.pi + (math.pi * i / steps)
            px = cx + radius * math.cos(angle)
            py = cy - radius * math.sin(angle)
            self.circle(px - thickness / 2, py - thickness / 2, thickness, style="F")

        # Score text centered in the gauge
        self.set_font("Degular", "B", 32)
        self.set_text_color(*TEXT_DARK)
        score_text = f"{score}%"
        tw = self.get_string_width(score_text)
        self.text(cx - tw / 2, cy - 4, score_text)

        # Label below score
        self.set_font("Inter", "", 8)
        self.set_text_color(*TEXT_LIGHT)
        label = "Unternehmerischer Freiheitsgrad"
        tw = self.get_string_width(label)
        self.text(cx - tw / 2, cy - radius * 0.2 + 8, label)

    def draw_pillar_bar(self, x, y, label, score, bar_width=95):
        """Draw labeled horizontal bar."""
        self.set_font("Inter", "", 9.5)
        self.set_text_color(*TEXT_MID)
        self.text(x, y + 4, label)

        bar_x = x + 65
        bar_h = 5

        # Background
        self.set_fill_color(*WARM_GRAY)
        self.rect(bar_x, y, bar_width, bar_h, style="F")

        # Score fill
        fill_w = max(bar_width * score / 100, 4)
        color = ORANGE if score < 40 else ((230, 150, 10) if score < 60 else DARK_TEAL)
        self.set_fill_color(*color)
        self.rect(bar_x, y, fill_w, bar_h, style="F")

        # Score text
        self.set_font("Inter", "B", 9.5)
        self.set_text_color(*TEXT_DARK)
        self.text(bar_x + bar_width + 4, y + 4, f"{score}%")

    def draw_quote_block(self, text):
        """Quote block with orange left border."""
        x = 20  # Always align with page margin
        y = self.get_y()
        w = 170

        # Measure text height
        self.set_font("Degular", "", 13)
        # Rough estimate
        lines = max(len(text) / 60, 1)
        h = max(lines * 7 + 14, 22)

        # Light background
        self.set_fill_color(*QUOTE_BG)
        self.rect(x, y, w, h, style="F")

        # Orange left bar
        self.set_fill_color(*ORANGE)
        self.rect(x, y, 2.5, h, style="F")

        # Text
        self.set_font("Degular", "", 13)
        self.set_text_color(*TEXT_DARK)
        self.set_xy(x + 8, y + 4)
        self.multi_cell(w - 14, 6.5, f"\u201E{text}\u201C", align="L")

        self.set_y(y + h + 4)

    def draw_color_block(self, text, bg=None, text_color=None):
        """Colored info block."""
        bg = bg or LIGHT_BG
        text_color = text_color or TEXT_MID
        x = 20  # Always align with page margin
        y = self.get_y()
        w = 170

        self.set_font("Inter", "", 9)
        lines = max(len(text) / 75, 1)
        h = max(lines * 5.5 + 14, 18)

        self.set_fill_color(*bg)
        self.rect(x, y, w, h, style="F")

        self.set_text_color(*text_color)
        self.set_xy(x + 6, y + 5)
        self.multi_cell(w - 12, 5, text, align="L")

        self.set_y(y + h + 4)

    def draw_orange_line(self, w=30):
        self.set_fill_color(*ORANGE)
        self.rect(self.get_x(), self.get_y(), w, 1.5, style="F")
        self.ln(5)

    def draw_section_divider(self):
        y = self.get_y()
        self.set_draw_color(*WARM_GRAY)
        self.set_line_width(0.2)
        self.line(20, y, self.w - 20, y)
        self.ln(6)

    def check_page_space(self, needed_mm):
        """Add page break if not enough space."""
        if self.get_y() + needed_mm > self.h - 25:
            self.add_page()

    # ── Build Document ──

    def build(self, output_path):
        data = self.data

        # ═══════════════════════════════
        # COVER PAGE
        # ═══════════════════════════════
        self.add_page()
        self.is_cover = True

        # Full-bleed title image
        self.image(TITLE_IMG, 0, 0, self.w, self.h)

        # Overlay text at bottom
        company = data.get("company_name")
        date_str = data.get("date", "")

        subtitle = ""
        if company:
            subtitle = f"für {company}"
        if date_str:
            subtitle = f"{subtitle}  ·  {date_str}" if subtitle else date_str

        if subtitle:
            self.set_font("Inter", "", 15)
            self.set_text_color(255, 255, 255)
            # Position below the headline text (which sits around y=115-140 in the image)
            self.set_xy(22, 168)
            self.cell(0, 8, subtitle)

        # ═══════════════════════════════
        # PAGE 2: PROFILE + SCORE
        # ═══════════════════════════════
        self.add_page()
        self.is_cover = False

        # Section: Unternehmensprofil
        self.set_font("Degular", "", 26)
        self.set_text_color(*TEXT_DARK)
        self.cell(170, 12, "Unternehmensprofil", new_x="LMARGIN", new_y="NEXT")
        self.draw_orange_line(35)

        # Profile table
        if data.get("profile_lines"):
            for label, value in data["profile_lines"]:
                y = self.get_y()
                self.set_font("Inter", "B", 9)
                self.set_text_color(*TEXT_LIGHT)
                self.set_xy(20, y)
                self.cell(42, 6, label)

                self.set_font("Inter", "", 10)
                self.set_text_color(*TEXT_DARK)
                self.set_xy(62, y)
                self.multi_cell(128, 5.5, value, align="L")

                # Divider line
                self.set_draw_color(*WARM_GRAY)
                self.set_line_width(0.1)
                self.line(20, self.get_y() + 1, self.w - 20, self.get_y() + 1)
                self.ln(3)

        self.ln(6)

        # Gauge chart
        self.set_font("Degular", "B", 18)
        self.set_text_color(*TEXT_DARK)
        self.cell(170, 10, "Dein Ergebnis", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

        gauge_x = (self.w - 64) / 2
        gauge_y = self.get_y()
        self.draw_gauge(gauge_x, gauge_y, data["score"])
        self.set_y(gauge_y + 70)  # Skip past the gauge completely

        # Pillar bars
        pillar_names = {
            "operations": "Operations & Führung",
            "systeme": "Systeme & Automatisierung",
            "ki": "KI-Readiness",
        }
        for key in ["operations", "systeme", "ki"]:
            self.draw_pillar_bar(20, self.get_y(), pillar_names[key], data["pillar_scores"][key])
            self.ln(10)

        self.ln(3)
        self.draw_section_divider()

        # Executive Summary
        self.set_font("Degular", "B", 18)
        self.set_text_color(*TEXT_DARK)
        self.cell(170, 10, "Executive Summary", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

        self.draw_color_block(data.get("executive_summary", ""))

        # ═══════════════════════════════
        # DETAIL PAGES
        # ═══════════════════════════════
        for section in data.get("sections", []):
            self.add_page()
            self.set_y(22)  # Clear header space

            # Title
            self.set_font("Degular", "", 26)
            self.set_text_color(*TEXT_DARK)
            self.cell(170, 12, section["title"], new_x="LMARGIN", new_y="NEXT")
            self.draw_orange_line(30)

            # Score badge
            score = section["score"]
            urgency = "Kritisch" if score < 20 else ("Handlungsbedarf" if score < 40 else ("Ausbaufähig" if score < 60 else "Solide"))
            color = ORANGE if score < 40 else ((200, 130, 10) if score < 60 else DARK_TEAL)
            self.set_font("Inter", "B", 10.5)
            self.set_text_color(*color)
            self.cell(170, 7, f"{urgency}  \u00b7  Score: {score}%", new_x="LMARGIN", new_y="NEXT")
            self.ln(6)

            # Diagnosis
            self.set_font("Degular", "B", 15)
            self.set_text_color(*DARK_TEAL)
            self.cell(170, 8, "Was deine Antworten verraten", new_x="LMARGIN", new_y="NEXT")
            self.ln(2)
            self.set_font("Inter", "", 10.5)
            self.set_text_color(*TEXT_MID)
            self.multi_cell(170, 5.5, section.get("diagnosis", ""), align="J")
            self.ln(5)

            # Quote
            if section.get("quote"):
                self.check_page_space(25)
                self.draw_quote_block(section["quote"])
                self.ln(3)

            # Quick Wins
            if section.get("quick_wins"):
                self.check_page_space(30)
                self.set_font("Degular", "B", 15)
                self.set_text_color(*DARK_TEAL)
                self.cell(170, 8, "Quick Wins", new_x="LMARGIN", new_y="NEXT")
                self.ln(2)
                for win in section["quick_wins"]:
                    self.check_page_space(12)
                    self.set_x(22)
                    self.set_font("Inter", "B", 10.5)
                    self.set_text_color(*ORANGE)
                    self.cell(5, 5.5, "\u2192")
                    self.set_font("Inter", "", 10.5)
                    self.set_text_color(*TEXT_MID)
                    self.multi_cell(160, 5.5, win, align="L")
                    self.ln(1.5)

            # Strategic measures
            if section.get("strategic"):
                self.ln(3)
                self.check_page_space(30)
                self.set_font("Degular", "B", 15)
                self.set_text_color(*DARK_TEAL)
                self.cell(170, 8, "Strategische Maßnahmen", new_x="LMARGIN", new_y="NEXT")
                self.ln(2)
                for measure in section["strategic"]:
                    self.check_page_space(12)
                    self.set_x(22)
                    self.set_font("Inter", "B", 10.5)
                    self.set_text_color(*ORANGE)
                    self.cell(5, 5.5, "\u2192")
                    self.set_font("Inter", "", 10.5)
                    self.set_text_color(*TEXT_MID)
                    self.multi_cell(160, 5.5, measure, align="L")
                    self.ln(1.5)

            # Leadtime pitch
            if section.get("leadtime_pitch"):
                self.ln(5)
                self.check_page_space(30)
                self.draw_color_block(
                    section["leadtime_pitch"],
                    bg=QUOTE_BG,
                    text_color=TEXT_DARK
                )

        # ═══════════════════════════════
        # CTA PAGE – Persönliches Angebot
        # ═══════════════════════════════
        self.add_page()
        self.set_y(22)

        company_ref = data.get("company_name") or "dein Unternehmen"
        contact_name = data.get("contact_name") or "du"

        # ── Section title ──
        self.set_font("Degular", "", 26)
        self.set_text_color(*TEXT_DARK)
        self.cell(170, 12, "Mein persönliches Angebot an dich", new_x="LMARGIN", new_y="NEXT")
        self.draw_orange_line(45)
        self.ln(4)

        # ── Photo + personal text side by side ──
        photo_x = 20
        photo_y = self.get_y()
        photo_w = 32
        photo_h = 40

        try:
            self.image(LUKAS_IMG, photo_x, photo_y, photo_w, photo_h)
        except Exception:
            pass

        # Personal text next to photo
        text_x = photo_x + photo_w + 8
        text_w = 170 - photo_w - 8
        self.set_xy(text_x, photo_y)
        self.set_font("Inter", "", 10.5)
        self.set_text_color(*TEXT_MID)

        personal_text = data.get("personal_cta_text") or (
            f"Ich habe mir deine Situation bei {company_ref} genau angeschaut. "
            f"Die Ergebnisse in diesem Papier sind kein theoretisches Consulting-Blabla – "
            f"das sind echte Hebel, die ich aus eigener Erfahrung kenne. "
            f"Ich habe selbst ein Unternehmen von 2 auf 40 Mitarbeiter skaliert und "
            f"weiß, wo es wehtut, wenn Systeme und Strukturen nicht mitwachsen."
        )
        self.multi_cell(text_w, 5.5, personal_text, align="L")
        text_end_y = self.get_y()

        # Continue below photo if text is shorter
        self.set_y(max(photo_y + photo_h + 3, text_end_y + 3))
        self.set_x(20)
        self.set_font("Inter", "", 10.5)
        self.set_text_color(*TEXT_MID)
        followup_text = (
            "Wenn du das Gefühl hast, dass da mehr geht – dann lass uns reden. "
            "Kein Pitch, kein Verkaufsgespräch. Einfach ein ehrliches Gespräch "
            "darüber, was bei euch als nächstes dran ist."
        )
        self.multi_cell(170, 5.5, followup_text, align="L")
        self.ln(4)

        # ── Signature ──
        sig_y = self.get_y()
        try:
            self.image(SIGNATURE_IMG, 20, sig_y, 38)
        except Exception:
            pass
        self.set_y(sig_y + 14)
        self.set_font("Inter", "B", 10)
        self.set_text_color(*TEXT_DARK)
        self.cell(170, 5, "Lukas Ebner", new_x="LMARGIN", new_y="NEXT")
        self.set_font("Inter", "", 8.5)
        self.set_text_color(*TEXT_LIGHT)
        self.cell(170, 4, "Gründer & Geschäftsführer, Leadtime Labs", new_x="LMARGIN", new_y="NEXT")

        self.ln(8)
        self.draw_section_divider()
        self.ln(4)

        # ═══════════════════════════════
        # OFFER SECTION (kein oranger Block)
        # ═══════════════════════════════
        self.set_font("Degular", "B", 20)
        self.set_text_color(*TEXT_DARK)
        self.cell(170, 10, "Strategy Workshop \u2013 Exklusivangebot", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

        self.set_font("Inter", "", 10)
        self.set_text_color(*TEXT_MID)
        self.cell(170, 5, f"1 Tag mit Lukas Ebner, zugeschnitten auf {company_ref}.", new_x="LMARGIN", new_y="NEXT")
        self.ln(5)

        # ── Price ──
        price_y = self.get_y()
        self.set_xy(20, price_y)

        # Old price first (strikethrough)
        self.set_font("Degular", "", 16)
        self.set_text_color(*TEXT_LIGHT)
        old_price = "1.000 \u20ac"
        old_w = self.get_string_width(old_price)
        old_x = self.get_x()
        self.cell(old_w, 10, old_price)
        # Strikethrough line
        self.set_draw_color(*TEXT_LIGHT)
        self.set_line_width(0.5)
        self.line(old_x, price_y + 5, old_x + old_w, price_y + 5)

        # Arrow
        self.set_x(old_x + old_w + 4)
        self.set_font("Inter", "", 14)
        self.set_text_color(*TEXT_LIGHT)
        self.cell(8, 10, "\u2192")

        # New price
        self.set_font("Degular", "B", 32)
        self.set_text_color(*ORANGE)
        self.cell(0, 10, "500 \u20ac")
        self.ln(12)

        # ── Checklist ──
        items = [
            "Analyse deiner aktuellen Prozesse und Strukturen",
            "Konkreter 90-Tage-Maßnahmenplan",
            "Leadtime Setup & Onboarding (wenn gewünscht)",
            "Follow-up-Call nach 6 Wochen",
        ]
        for item in items:
            self.set_x(22)
            self.set_font("Inter", "B", 10)
            self.set_text_color(*DARK_TEAL)
            self.cell(5, 5.5, "\u2713")
            self.set_font("Inter", "", 10)
            self.set_text_color(*TEXT_MID)
            self.cell(160, 5.5, item, new_x="LMARGIN", new_y="NEXT")
            self.ln(1.5)

        self.ln(5)

        # ── Aktionscode + Deadline ──
        code_y = self.get_y()
        # Light background box for code + deadline
        self.set_fill_color(*LIGHT_BG)
        self.rect(20, code_y, 170, 28, style="F")

        # Orange left accent
        self.set_fill_color(*ORANGE)
        self.rect(20, code_y, 3, 28, style="F")

        self.set_xy(30, code_y + 4)
        self.set_font("Inter", "B", 9)
        self.set_text_color(*TEXT_LIGHT)
        self.cell(0, 5, "DEIN AKTIONSCODE")

        self.set_xy(30, code_y + 10)
        self.set_font("Degular", "B", 22)
        self.set_text_color(*ORANGE)
        self.cell(0, 9, data.get("action_code", "STRATEGIE-2026"))

        self.set_xy(30, code_y + 20)
        self.set_font("Inter", "", 9)
        self.set_text_color(*TEXT_MID)
        self.cell(0, 5, f"Einzulösen bis {data.get('cta_deadline', '')}  \u00b7  lukasebner.de/erstgespraech")

        self.set_y(code_y + 34)
        self.set_font("Inter", "", 8.5)
        self.set_text_color(*TEXT_LIGHT)
        self.cell(170, 4, "Gib den Code bei der Buchung deines Erstgesprächs ein, um das Angebot zu aktivieren.", new_x="LMARGIN", new_y="NEXT")

        # Save
        self.output(output_path)
        print(f"  \u2713 PDF generated: {output_path}")


# ── Test ──

if __name__ == "__main__":
    deadline_date = datetime.now() + timedelta(days=30)
    deadline = deadline_date.strftime("%d.%m.%Y")
    code = generate_action_code("Fracto GmbH", "info@fracto.de")

    test_data = {
        "company_name": "Fracto GmbH",
        "contact_name": "Laurin",
        "date": "25. März 2026",
        "score": 38,
        "action_code": code,
        "pillar_scores": {"operations": 18, "systeme": 22, "ki": 12},
        "profile_lines": [
            ("Firma", "Fracto GmbH"),
            ("Standort", "Yorckstraße 22, 93049 Regensburg"),
            ("Geschäftsführung", "Laurin Gerdes (CEO), Lukas Ebner (CTO/COO)"),
            ("Branche", "E-Learning für Medizintechnik"),
            ("Geschäftsmodell", "B2B SaaS – KI-gestützte Kurserstellung"),
            ("Referenzkunden", "Mindray (MedTech-Hersteller)"),
            ("USP", "30 Minuten statt 30 Tage Kurserstellung"),
        ],
        "executive_summary": (
            "Fracto steht vor dem klassischen Scale-up-Dilemma: Ihr habt ein innovatives "
            "Produkt mit starkem USP entwickelt, aber die interne Infrastruktur hinkt hinterher. "
            "Während ihr für eure Kunden KI-basierte Automatisierung liefert, arbeitet ihr selbst "
            "noch in einem System aus Einzeltools und persönlichen Abhängigkeiten. Die niedrigen "
            "Scores in allen drei Bereichen zeigen: Der Gründerflaschenhals wird euch bremsen, "
            "bevor ihr das Potenzial eures MedTech-Fokus ausschöpfen könnt."
        ),
        "sections": [
            {
                "title": "KI-Readiness & Prototyping",
                "score": 12,
                "diagnosis": (
                    "Du siehst in allen drei KI-Fragen dringenden Handlungsbedarf. "
                    "Für ein KI-Unternehmen ist das paradox – ihr verkauft KI-Lösungen "
                    "an MedTech-Hersteller, aber nutzt intern keine systematische KI-Strategie. "
                    "Euer Team nutzt KI noch nicht im Arbeitsalltag, und ihr seht KI noch nicht "
                    "als echten Wettbewerbsvorteil für Fracto selbst."
                ),
                "quote": "Ihr automatisiert Schulungen für andere – aber eure eigenen Prozesse laufen noch manuell.",
                "quick_wins": [
                    "Team-weite KI-Tools einführen: ChatGPT/Claude Pro für alle Mitarbeiter",
                    "Wöchentliche KI-Sessions: Jeden Freitag 1h 'Was können wir automatisieren?'",
                    "Euer eigenes Produkt für interne Schulungen und Onboarding nutzen",
                ],
                "strategic": [
                    "KI-Roadmap entwickeln: Sales-Automatisierung, Content-Skalierung, Support-Bots",
                    "Case Study aufbauen: Wie interne KI-Nutzung euch effizienter macht",
                    "Thought Leadership: Regelmäßige Insights über KI in der MedTech-Praxis",
                ],
                "leadtime_pitch": None,
            },
            {
                "title": "Operations & Führung",
                "score": 18,
                "diagnosis": (
                    "Das Unternehmen läuft noch nicht ohne euch. Rollen sind nicht ersetzbar, "
                    "und du arbeitest noch zu viel im statt am Unternehmen. Mit zwei Geschäftsführern "
                    "(Laurin als Mediziner, du als Tech-Veteran) habt ihr komplementäre Skills – "
                    "aber vermutlich keine klare Aufgabentrennung und Vertretungsregelungen."
                ),
                "quote": "Du bist in jedem Meeting, weil sonst nichts entschieden wird.",
                "quick_wins": [
                    "Rollen-Audit: Wer macht was? Wo gibt es Überschneidungen?",
                    "Entscheidungsmatrix erstellen: Was darf wer ohne den anderen entscheiden?",
                    "Eine operative Aufgabe pro Woche komplett delegieren",
                ],
                "strategic": [
                    "Customer Success Rolle besetzen – für Kunden wie Mindray",
                    "SOPs für die 10 häufigsten Prozesse dokumentieren",
                    "Urlaubs-Test: 2 Wochen ohne dich – wo brennt es?",
                ],
                "leadtime_pitch": None,
            },
            {
                "title": "Systeme & Automatisierung",
                "score": 22,
                "diagnosis": (
                    "Informationen sind nicht zentral verfügbar, du brauchst dringend einen "
                    "Gesamtüberblick, und wiederkehrende Abläufe laufen noch nicht automatisch. "
                    "Fracto hat vermutlich das typische Startup-Setup: Slack, Excel, Trello, "
                    "E-Mail, GitHub – ein Flickenteppich ohne zentrale Wahrheit."
                ),
                "quote": "Die anderen Tools sind Werkzeugkästen – du musst die Küche selbst bauen. Leadtime ist die fertige Küche.",
                "quick_wins": [
                    "Tool-Inventur: Liste alle Tools auf, die ihr aktuell nutzt",
                    "Leadtime 30-Tage-Trial starten – Projektplanung, Kapazität und Finanzen in einem",
                    "Kundenprojekte (Mindray etc.) in Leadtime als erste Templates anlegen",
                ],
                "strategic": [
                    "Leadtime als zentrale Plattform für alle Kundenprojekte und Kapazitätsplanung",
                    "Automatisierte Status-Updates für Kunden statt manueller E-Mails",
                    "Financial Dashboard: MRR, Projektmargen, Auslastung auf einen Blick",
                ],
                "leadtime_pitch": (
                    "Empfehlung: Leadtime – Projektplanung, Kapazitätsmanagement und "
                    "Finanzen in einer Plattform. Sofort einsatzbereit, kein monatelanges Setup. "
                    "29 €/User/Monat, 30 Tage kostenlos testen. Für ein Team von 5-10 Personen "
                    "ersetzt Leadtime den kompletten Tool-Zoo und gibt euch die Transparenz, "
                    "die ihr braucht, um sauber zu skalieren. → leadtime.app"
                ),
            },
        ],
        "cta_deadline": deadline,
    }

    output = "/sessions/practical-tender-faraday/mnt/ebner/strategy-paper-fracto.pdf"
    pdf = StrategyPDF(test_data)
    pdf.build(output)
