"""Meldet Seiten von lukasebner.de an IndexNow (Bing, Copilot/ChatGPT-Suche, Yandex, Seznam, Naver).
Google nutzt IndexNow nicht.

Der Schlüssel ist kein Geheimnis: IndexNow prüft ihn über https://lukasebner.de/<schlüssel>.txt (liegt in public/).

  python3 scripts/indexnow.py                     URLs mit lastmod ab gestern + Startseite und Blog-Index
  python3 scripts/indexnow.py --seit 2026-11-01   ab einem Datum
  python3 scripts/indexnow.py --alle              alle URLs der Sitemap (nach größeren Änderungen)
  python3 scripts/indexnow.py --trocken …         nur anzeigen, nichts senden
  python3 scripts/indexnow.py https://lukasebner.de/preise …   einzelne URLs
"""
import datetime, json, re, sys, urllib.request

SITE = "https://lukasebner.de"
HOST = "lukasebner.de"
KEY = "6b8fcf9a0c1671c84df9f50661924731"


def sitemap():
    xml = urllib.request.urlopen(SITE + "/sitemap.xml", timeout=30).read().decode()
    out = []
    for block in re.findall(r"<url>(.*?)</url>", xml, re.S):
        loc = re.search(r"<loc>([^<]+)</loc>", block)
        lm = re.search(r"<lastmod>([^<]+)</lastmod>", block)
        if loc:
            out.append((loc.group(1).strip(), lm.group(1)[:10] if lm else None))
    return out


def main(args):
    dry = "--trocken" in args
    args = [a for a in args if a != "--trocken"]
    check = urllib.request.urlopen(f"{SITE}/{KEY}.txt", timeout=30).read().decode().strip()
    if check != KEY:
        sys.exit(f"{SITE}/{KEY}.txt liefert nicht den Schlüssel. Ist der neue Build live?")
    if any(a.startswith("http") for a in args):
        urls = [a for a in args if a.startswith("http")]
    elif "--alle" in args:
        urls = [u for u, _ in sitemap()]
    else:
        since = args[args.index("--seit") + 1] if "--seit" in args else (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
        urls = [u for u, lm in sitemap() if lm and lm >= since]
        for extra in (SITE, f"{SITE}/blog"):
            if extra not in urls:
                urls.append(extra)
    print(f"{len(urls)} URLs" + (" (trocken)" if dry else ""))
    for u in urls:
        print("  " + u)
    if dry or not urls:
        return
    body = json.dumps({"host": HOST, "key": KEY, "keyLocation": f"{SITE}/{KEY}.txt", "urlList": urls[:10000]}).encode()
    req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body, headers={"Content-Type": "application/json; charset=utf-8"})
    with urllib.request.urlopen(req, timeout=30) as r:
        print("IndexNow:", r.status, "(200/202 = angenommen)")


if __name__ == "__main__":
    main(sys.argv[1:])
