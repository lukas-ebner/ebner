#!/usr/bin/env python3
"""
Action Code Reminder Checker

Checks for action codes expiring within 7 days and sends reminder emails.
Designed to be called daily by a scheduled task.

Usage:
  python check-reminders.py [--dry-run] [--base-url https://lukasebner.de]

Email sending requires RESEND_API_KEY in environment.
If no key is set, prints reminders to stdout (useful for testing).
"""

import os
import sys
import json
import argparse
from datetime import datetime

# ── Configuration ──
DEFAULT_BASE_URL = "https://lukasebner.de"
FROM_EMAIL = "lukas@lukasebner.de"
FROM_NAME = "Lukas Ebner"
REPLY_TO = "lukas@lukasebner.de"


def check_pending_reminders(base_url: str) -> list:
    """Call the remind API to get codes needing reminder."""
    import urllib.request
    url = f"{base_url}/api/action-codes/remind"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            return data.get("pending", [])
    except Exception as e:
        print(f"  ✗ Error checking reminders: {e}")
        return []


def mark_reminders_sent(base_url: str, codes: list[str]):
    """Mark reminders as sent via POST."""
    import urllib.request
    url = f"{base_url}/api/action-codes/remind"
    payload = json.dumps({"codes": codes}).encode()
    req = urllib.request.Request(url, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            print(f"  ✓ Marked {data.get('updated', 0)} reminders as sent")
    except Exception as e:
        print(f"  ✗ Error marking reminders: {e}")


def send_email_resend(to_email: str, subject: str, html: str, api_key: str):
    """Send email via Resend API."""
    import urllib.request
    payload = json.dumps({
        "from": f"{FROM_NAME} <{FROM_EMAIL}>",
        "to": [to_email],
        "reply_to": REPLY_TO,
        "subject": subject,
        "html": html,
    }).encode()
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        method="POST",
    )
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {api_key}")
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())


def build_reminder_email(entry: dict) -> tuple[str, str]:
    """Build subject and HTML for a reminder email."""
    company = entry.get("company", "dein Unternehmen")
    days_left = entry.get("daysLeft", 7)
    code = entry["code"]
    deadline = entry.get("deadline", "")

    # Format deadline nicely
    try:
        dl = datetime.fromisoformat(deadline.replace("Z", "+00:00"))
        deadline_str = dl.strftime("%d.%m.%Y")
    except Exception:
        deadline_str = deadline

    subject = f"Dein Strategy-Workshop-Angebot läuft in {days_left} Tagen ab"

    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <p style="font-size: 16px; line-height: 1.6;">Hey,</p>

      <p style="font-size: 16px; line-height: 1.6;">
        kurze Erinnerung: Dein persönliches Workshop-Angebot für <strong>{company}</strong>
        läuft am <strong>{deadline_str}</strong> ab – das sind noch <strong>{days_left} Tage</strong>.
      </p>

      <div style="background: #f5f5f0; border-left: 4px solid #F44900; padding: 16px 20px; margin: 24px 0;">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #7a7a7a; text-transform: uppercase; letter-spacing: 1px;">Dein Aktionscode</p>
        <p style="margin: 0; font-size: 22px; font-weight: bold; color: #F44900; letter-spacing: 2px;">{code}</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #4a4a4a;">Strategy Workshop: <strong>500 €</strong> statt 1.000 € · gültig bis {deadline_str}</p>
      </div>

      <p style="font-size: 16px; line-height: 1.6;">
        Falls du Fragen hast oder direkt loslegen willst – buch einfach ein Erstgespräch
        und gib deinen Code ein:
      </p>

      <p style="margin: 24px 0;">
        <a href="https://lukasebner.de/erstgespraech#bewerbung"
           style="display: inline-block; background: #F44900; color: white; text-decoration: none; padding: 12px 28px; border-radius: 50px; font-size: 14px; font-weight: 600;">
          Erstgespräch buchen
        </a>
      </p>

      <p style="font-size: 16px; line-height: 1.6;">
        Kein Druck. Aber wenn du eh weißt, dass du das brauchst – dann lieber jetzt als
        nach dem Ablaufdatum.
      </p>

      <p style="font-size: 16px; line-height: 1.6; margin-top: 32px;">
        Beste Grüße,<br>
        <strong>Lukas</strong>
      </p>

      <hr style="border: none; border-top: 1px solid #e8e5de; margin: 32px 0 16px;">
      <p style="font-size: 12px; color: #7a7a7a; line-height: 1.6;">
        Lukas Ebner<br>
        Wachstumcoach GmbH | HRB 19991, Amtsgericht Regensburg<br>
        Yorckstr. 22, 93049 Regensburg | Fon: +49 941 463 909 80<br>
        <a href="https://lukasebner.de" style="color: #7a7a7a;">lukasebner.de</a><br><br>
        Du bekommst diese Mail, weil du ein persönliches Strategiepapier erhalten hast.
      </p>
    </div>
    """

    return subject, html


def main():
    parser = argparse.ArgumentParser(description="Check and send action code reminders")
    parser.add_argument("--dry-run", action="store_true", help="Don't send emails, just print")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="Base URL of the website")
    args = parser.parse_args()

    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M')}] Checking action code reminders...")

    pending = check_pending_reminders(args.base_url)

    if not pending:
        print("  ✓ No reminders to send")
        return

    print(f"  → {len(pending)} reminder(s) pending")

    resend_key = os.environ.get("RESEND_API_KEY")
    sent_codes = []

    for entry in pending:
        subject, html = build_reminder_email(entry)

        if args.dry_run or not resend_key:
            if not resend_key and not args.dry_run:
                print("  ⚠ No RESEND_API_KEY set – printing instead of sending")
            print(f"\n  📧 To: {entry['email']}")
            print(f"     Subject: {subject}")
            print(f"     Code: {entry['code']} | Company: {entry.get('company')} | Days left: {entry['daysLeft']}")
            if args.dry_run:
                sent_codes.append(entry["code"])
        else:
            try:
                result = send_email_resend(entry["email"], subject, html, resend_key)
                print(f"  ✓ Sent reminder to {entry['email']} (id: {result.get('id', '?')})")
                sent_codes.append(entry["code"])
            except Exception as e:
                print(f"  ✗ Failed to send to {entry['email']}: {e}")

    # Mark sent reminders
    if sent_codes and not args.dry_run:
        mark_reminders_sent(args.base_url, sent_codes)

    print(f"\n  Done. {len(sent_codes)}/{len(pending)} reminders processed.")


if __name__ == "__main__":
    main()
