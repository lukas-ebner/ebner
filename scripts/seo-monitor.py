"""Monatliches SEO-Monitoring für lukasebner.de über DataForSEO (api4seo). Nur Standardbibliothek.

Misst
  1. Ranked Keywords von lukasebner.de in Google DE (DataForSEO Labs)
  2. Google-DE-Position für jedes Keyword aus scripts/seo-keywords.json (Live-SERP, Top 30),
     dazu, ob ein AI Overview lukasebner.de zitiert
  3. Backlink-Summary (verweisende Domains, Rank, Spam-Score)

Schreibt einen Markdown-Bericht mit Vergleich zum letzten Lauf und hängt den Lauf an den Verlauf (JSON) an.

  python3 scripts/seo-monitor.py                 voller Lauf
  python3 scripts/seo-monitor.py --trocken       nur Plan und geschätzte Kosten, keine Abfrage
  python3 scripts/seo-monitor.py --notizen DIR   Bericht zusätzlich nach DIR kopieren
  python3 scripts/seo-monitor.py --deckel 0.30   anderer Kostendeckel in USD (Standard 0,50)

Zugang: ~/Desktop/Cleanup/api4seo.txt (Zeile 1 Login, Zeile 2 Passwort) oder Umgebungsvariablen
DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD. Der Zugang wird nie ausgegeben.
"""
import base64, datetime, json, os, pathlib, shutil, sys, urllib.error, urllib.parse, urllib.request

DOMAIN = "lukasebner.de"
LOCATION = 2276  # Deutschland
LANGUAGE = "de"
SERP_DEPTH = 30
COST_CAP = 0.50

ROOT = pathlib.Path(__file__).resolve().parent.parent
KEYWORDS_FILE = ROOT / "scripts" / "seo-keywords.json"
OUT_DIR = ROOT / "data" / "seo-monitor"
HISTORY_FILE = OUT_DIR / "verlauf.json"
REPORT_DIR = OUT_DIR / "berichte"
CRED_FILE = pathlib.Path.home() / "Desktop" / "Cleanup" / "api4seo.txt"

# Vorsichtige Schätzungen in USD, bevor der erste echte Preis bekannt ist.
EST = {"ranked": 0.12, "backlinks": 0.03, "serp": 0.006}


class CapReached(Exception):
    pass


class Client:
    def __init__(self, cap):
        login = os.environ.get("DATAFORSEO_LOGIN")
        pw = os.environ.get("DATAFORSEO_PASSWORD")
        if not (login and pw):
            if not CRED_FILE.exists():
                sys.exit(f"Kein Zugang: {CRED_FILE} fehlt und DATAFORSEO_LOGIN/PASSWORD nicht gesetzt.")
            lines = [l.strip() for l in CRED_FILE.read_text().splitlines() if l.strip()]
            if len(lines) < 2:
                sys.exit(f"{CRED_FILE} braucht Login (Zeile 1) und Passwort (Zeile 2).")
            login, pw = lines[0], lines[1]
        self._auth = base64.b64encode(f"{login}:{pw}".encode()).decode()
        self.cap = cap
        self.spent = 0.0
        self.calls = []

    def post(self, path, task, estimate, label):
        if self.spent + estimate > self.cap:
            raise CapReached(f"{label}: {self.spent:.4f} + ~{estimate:.4f} USD würde den Deckel von {self.cap:.2f} USD überschreiten")
        req = urllib.request.Request(
            "https://api.dataforseo.com" + path,
            data=json.dumps([task]).encode(),
            headers={"Authorization": "Basic " + self._auth, "Content-Type": "application/json"},
        )
        try:
            data = json.load(urllib.request.urlopen(req, timeout=180))
        except urllib.error.HTTPError as e:  # Fehlertext ohne Header ausgeben (enthält keinen Zugang)
            return None, f"HTTP {e.code}"
        cost = float(data.get("cost") or 0)
        self.spent += cost
        self.calls.append({"label": label, "cost": round(cost, 5)})
        tasks = data.get("tasks") or [{}]
        t = tasks[0]
        if t.get("status_code") != 20000:
            return None, f"{t.get('status_code')} {t.get('status_message')}"
        return (t.get("result") or [None])[0], None


def host_of(url):
    try:
        u = urllib.parse.urlparse(url or "")
    except ValueError:
        return ""
    # Google-Weiterleitungen (google.com/goto?url=…, /url?q=…) auflösen
    if u.netloc.endswith("google.com") or u.netloc.endswith("google.de"):
        q = urllib.parse.parse_qs(u.query)
        for k in ("url", "q", "u"):
            if q.get(k):
                return host_of(q[k][0])
    return u.netloc.lower().removeprefix("www.")


def path_of(url):
    u = urllib.parse.urlparse(url or "")
    if u.netloc.endswith(("google.com", "google.de")):
        q = urllib.parse.parse_qs(u.query)
        for k in ("url", "q", "u"):
            if q.get(k):
                return path_of(q[k][0])
    return u.path or "/"


def found_path(item):
    """Pfad des Treffers. Bei verschlüsselter Google-Weiterleitung aus dem Breadcrumb
    („https://lukasebner.de › blog › …“) zusammengesetzt."""
    url = item.get("url") or ""
    if host_of(url).endswith(DOMAIN):
        return path_of(url)
    crumb = item.get("breadcrumb") or ""
    parts = [p.strip() for p in crumb.split("›")[1:] if p.strip() and p.strip() != "..."]
    return "/" + "/".join(parts) if parts else "/"


def is_ours(item):
    """Treffer über Domain, URL (auch Google-Weiterleitung), Breadcrumb oder – nur bei unlesbarer
    Weiterleitung – über den Titel."""
    fields = [item.get("domain") or "", item.get("breadcrumb") or ""]
    if any(DOMAIN in f.lower() for f in fields):
        return True
    url = item.get("url") or ""
    if host_of(url).endswith(DOMAIN):
        return True
    if "google." in urllib.parse.urlparse(url).netloc and not host_of(url):  # Weiterleitung ohne lesbares Ziel
        title = (item.get("title") or "").lower()
        return "lukasebner.de" in title or ("lukas ebner" in title and "wachstumscoach" in title)
    return False


def ranked_keywords(c):
    res, err = c.post(
        "/v3/dataforseo_labs/google/ranked_keywords/live",
        {"target": DOMAIN, "location_code": LOCATION, "language_code": LANGUAGE, "limit": 1000,
         "order_by": ["ranked_serp_element.serp_item.rank_group,asc"]},
        EST["ranked"], "ranked_keywords",
    )
    if err or not res:
        return {"fehler": err or "leer"}
    items = []
    for it in res.get("items") or []:
        kd = it.get("keyword_data") or {}
        si = (it.get("ranked_serp_element") or {}).get("serp_item") or {}
        items.append({
            "keyword": kd.get("keyword"),
            "volumen": (kd.get("keyword_info") or {}).get("search_volume"),
            "position": si.get("rank_group"),
            "url": path_of(si.get("url")),
            "etv": round(si.get("etv") or 0, 2),
        })
    org = ((res.get("metrics") or {}).get("organic") or {})
    return {
        "anzahl": res.get("total_count", len(items)),
        "top3": (org.get("pos_1") or 0) + (org.get("pos_2_3") or 0),
        "top10": (org.get("pos_1") or 0) + (org.get("pos_2_3") or 0) + (org.get("pos_4_10") or 0),
        "top30": sum(org.get(k) or 0 for k in ("pos_1", "pos_2_3", "pos_4_10", "pos_11_20", "pos_21_30")),
        "etv": round(org.get("etv") or 0, 1),
        "keywords": items,
    }


def backlinks(c):
    res, err = c.post(
        "/v3/backlinks/summary/live",
        {"target": DOMAIN, "include_subdomains": True, "backlinks_status_type": "live"},
        EST["backlinks"], "backlinks_summary",
    )
    if err or not res:
        return {"fehler": err or "leer"}
    return {k: res.get(k) for k in (
        "rank", "backlinks", "referring_domains", "referring_main_domains",
        "referring_domains_nofollow", "backlinks_spam_score", "broken_backlinks")}


def serp(c, kw, est):
    task = {"keyword": kw, "location_code": LOCATION, "language_code": LANGUAGE,
            "depth": SERP_DEPTH, "device": "desktop"}
    res, err = c.post("/v3/serp/google/organic/live/advanced", task, est, "serp:" + kw)
    if err:  # Google-Fehler oder Teilergebnis bei DataForSEO: einmal wiederholen
        res, err = c.post("/v3/serp/google/organic/live/advanced", task, est, "serp (2. Versuch):" + kw)
    if err or not res:
        return {"fehler": err or "leer"}
    pos, url, aio, aio_ours = None, None, False, False
    for it in res.get("items") or []:
        t = it.get("type")
        if t == "organic" and pos is None and is_ours(it):
            pos, url = it.get("rank_group"), found_path(it)
        elif t == "ai_overview":
            aio = True
            refs = list(it.get("references") or [])
            for sub in it.get("items") or []:
                refs += sub.get("references") or []
            aio_ours = aio_ours or any(is_ours(r) for r in refs)
    return {"position": pos, "url": url, "ai_overview": aio, "aio_zitiert_uns": aio_ours}


def fmt_delta(new, old, lower_is_better=False):
    if new is None or old is None:
        return ""
    d = new - old
    if d == 0:
        return "±0"
    good = d < 0 if lower_is_better else d > 0
    return f"{'+' if d > 0 else ''}{d:g} {'▲' if good else '▼'}"


def pos_txt(p):
    return f"{p}" if p else f">{SERP_DEPTH}"


def report(run, prev):
    L = [f"# SEO-Monitoring lukasebner.de – {run['datum']}", ""]
    L.append(f"Google DE, Desktop, SERP-Tiefe {SERP_DEPTH}. Kosten dieses Laufs: {run['kosten_usd']:.3f} USD."
             + (f" Vergleich mit Lauf vom {prev['datum']}." if prev else " Erster Lauf (Baseline)."))
    if run.get("abgebrochen"):
        L += ["", f"**Lauf vorzeitig beendet:** {run['abgebrochen']}"]
    rk, prk = run["ranked"], (prev or {}).get("ranked", {})
    L += ["", "## Kennzahlen", "", "| Kennzahl | Jetzt | Vorher | Δ |", "|---|---|---|---|"]

    def row(name, new, old, lib=False):
        L.append(f"| {name} | {new if new is not None else '–'} | {old if old is not None else '–'} | {fmt_delta(new, old, lib)} |")

    row("Rankende Keywords (Top 100)", rk.get("anzahl"), prk.get("anzahl"))
    row("davon Top 10", rk.get("top10"), prk.get("top10"))
    row("davon Top 30", rk.get("top30"), prk.get("top30"))
    row("Geschätzte Besuche/Monat (ETV)", rk.get("etv"), prk.get("etv"))
    bl, pbl = run["backlinks"], (prev or {}).get("backlinks", {})
    row("Verweisende Domains", bl.get("referring_domains"), pbl.get("referring_domains"))
    row("Backlinks", bl.get("backlinks"), pbl.get("backlinks"))
    row("Domain-Rank (0–1000)", bl.get("rank"), pbl.get("rank"))
    row("Spam-Score Backlinks", bl.get("backlinks_spam_score"), pbl.get("backlinks_spam_score"), True)
    tracked = run["serp"]
    in10 = sum(1 for v in tracked.values() if v.get("position") and v["position"] <= 10)
    in30 = sum(1 for v in tracked.values() if v.get("position"))
    prev_s = (prev or {}).get("serp", {})
    pin10 = sum(1 for v in prev_s.values() if v.get("position") and v["position"] <= 10) if prev else None
    pin30 = sum(1 for v in prev_s.values() if v.get("position")) if prev else None
    row(f"Beobachtete Begriffe in Top 10 (von {len(tracked)})", in10, pin10)
    row(f"Beobachtete Begriffe in Top {SERP_DEPTH}", in30, pin30)
    for name in ("ranked", "backlinks"):
        if run[name].get("fehler"):
            L.append(f"\n_{name}: {run[name]['fehler']}_")

    L += ["", "## Beobachtete Begriffe", "",
          "| Begriff | Cluster | KPI | Position | Vorher | Δ | Gefundene URL | Ziel | AI Overview |",
          "|---|---|---|---|---|---|---|---|---|"]
    for kw in run["keyword_set"]:
        k = kw["keyword"]
        v = tracked.get(k)
        if v is None:
            L.append(f"| {k} | {kw['cluster']} | {'★' if kw.get('kpi') else ''} | nicht abgefragt | | | | {kw.get('ziel','')} | |")
            continue
        if v.get("fehler"):
            L.append(f"| {k} | {kw['cluster']} | {'★' if kw.get('kpi') else ''} | Fehler: {v['fehler']} | | | | {kw.get('ziel','')} | |")
            continue
        pv = prev_s.get(k, {})
        old = pv.get("position") if pv else None
        new = v.get("position")
        if prev and k in prev_s:
            d = fmt_delta(new or SERP_DEPTH + 1, old or SERP_DEPTH + 1, True)
            d = "" if d == "±0" and not new else d
        else:
            d = "neu"
        aio = "zitiert uns" if v.get("aio_zitiert_uns") else ("ja, ohne uns" if v.get("ai_overview") else "–")
        L.append(f"| {k} | {kw['cluster']} | {'★' if kw.get('kpi') else ''} | {pos_txt(new)} | "
                 f"{pos_txt(old) if prev and k in prev_s else '–'} | {d} | {v.get('url') or ''} | {kw.get('ziel','')} | {aio} |")

    items = rk.get("keywords") or []
    if items:
        prev_rank = {i["keyword"]: i["position"] for i in prk.get("keywords") or []}
        L += ["", "## Rankende Keywords (DataForSEO Labs, beste 50)", "",
              "| Keyword | Volumen | Position | Vorher | URL |", "|---|---|---|---|---|"]
        for i in items[:50]:
            old = prev_rank.get(i["keyword"])
            L.append(f"| {i['keyword']} | {i['volumen'] or '–'} | {i['position']} | "
                     f"{old if old else ('neu' if prev else '–')} | {i['url']} |")
        if prev:
            lost = [k for k in prev_rank if k not in {i['keyword'] for i in items}]
            if lost:
                L += ["", "Nicht mehr rankend: " + ", ".join(sorted(lost))]
    L += ["", "## Kosten je Abfrage", "", ", ".join(f"{c['label']}: {c['cost']}" for c in run["abfragen"]) or "–", ""]
    return "\n".join(L)


def main(args):
    cap = COST_CAP
    if "--deckel" in args:
        cap = float(args[args.index("--deckel") + 1])
    notes = pathlib.Path(args[args.index("--notizen") + 1]).expanduser() if "--notizen" in args else None
    kws = json.loads(KEYWORDS_FILE.read_text())["keywords"]
    est_total = EST["ranked"] + EST["backlinks"] + EST["serp"] * len(kws)
    if "--trocken" in args:
        print(f"{len(kws)} Begriffe, geschätzte Kosten ≤ {est_total:.2f} USD, Deckel {cap:.2f} USD.")
        for k in kws:
            print(" -", k["keyword"])
        return

    c = Client(cap)
    today = datetime.date.today().isoformat()
    run = {"datum": today, "keyword_set": kws, "serp": {}, "ranked": {}, "backlinks": {}}
    try:
        run["ranked"] = ranked_keywords(c)
        run["backlinks"] = backlinks(c)
        est = EST["serp"]
        for i, kw in enumerate(kws):
            run["serp"][kw["keyword"]] = serp(c, kw["keyword"], est)
            # Nach der ersten Abfrage mit dem echten Preis weiterschätzen (mit Puffer)
            if i == 0 and c.calls and c.calls[-1]["label"].startswith("serp:"):
                est = max(c.calls[-1]["cost"] * 1.2, 0.0005)
    except CapReached as e:
        run["abgebrochen"] = str(e)
    run["kosten_usd"] = round(c.spent, 4)
    run["abfragen"] = c.calls

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    history = json.loads(HISTORY_FILE.read_text()) if HISTORY_FILE.exists() else []
    prev = next((h for h in reversed(history) if h["datum"] != today), None)
    history = [h for h in history if h["datum"] != today] + [run]
    HISTORY_FILE.write_text(json.dumps(history, ensure_ascii=False, indent=1) + "\n")
    md = report(run, prev)
    out = REPORT_DIR / f"{today}.md"
    out.write_text(md)
    if notes:
        notes.mkdir(parents=True, exist_ok=True)
        shutil.copy(out, notes / f"seo-monitoring-{today}.md")
    print(f"Bericht: {out}" + (f" (Kopie in {notes})" if notes else ""))
    print(f"Kosten: {c.spent:.4f} USD (Deckel {cap:.2f})" + (f" – ABGEBROCHEN: {run['abgebrochen']}" if run.get("abgebrochen") else ""))


if __name__ == "__main__":
    main(sys.argv[1:])
