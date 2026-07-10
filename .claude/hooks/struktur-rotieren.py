#!/usr/bin/env python3
"""STRUKTUR.md-Rotation + Re-Akkumulations-Wächter (QS-TOK / FAHRPLAN-TOKEN-OEKONOMIE.md §3 T1).

STRUKTUR.md wird in JEDER Session und jedem Subagenten gelesen (Pflicht-Read). Die
Session-Karten wuchsen trotz Pflegeregel bis 452 KB (§1 Ist-Befund) — die manuelle
Rotation blieb liegen, der bestehende Hook WARNTE nur. T1 mechanisiert das Verschieben:
abgeschlossene Karten (älter als ~2 Arbeitstage) wandern BYTE-GENAU nach
`archiv/STRUKTUR-SESSIONKARTEN.md`; im Kopf bleibt der Verweis-Abschnitt.

LEITPLANKE (§3 T1 R): **verschieben, NIE zusammenfassen** (Zusammenfassen = ~40 %
Retrieval-Verlust). Kein Inhalt geht verloren — Byte-Bilanz beweist Erhalt.

Modi:
  --hook       SessionStart-Verhalten: rotieren + committen NUR im sicheren Kontext
               (K §3 T1: Haupt-Checkout [git-dir == git-common-dir, kein Worktree],
               git-clean, sofort `docs(STRUKTUR…)`-Commit statt WIP — §12.1). Sonst
               reiner No-op. Danach Re-Akkumulations-Wächter als weicher Hinweis
               (blockiert NIE — §3 T1 R «nie blockieren»).
  --write      Rotation ausführen + Dateien schreiben, NICHT committen (manuell/Dogfood;
               Pathspec-Commit macht der Aufrufer). Druckt Byte-Bilanz.
  --dry-run    Rotationsplan + Byte-Bilanz drucken, nichts schreiben.
  --check      Nur Re-Akkumulations-Wächter (T7-K Teil 2). Exit 1, wenn ein
               Steuer-Dokument sein Budget überschreitet (optionaler Riegel; NICHT im
               Required-Gate verdrahtet, damit Parallel-PRs nie blockiert werden).

git nicht verfügbar / Fehler / kein sicherer Kontext → still Exit 0 (nie stören).
"""
import json
import os
import re
import subprocess
import sys
from datetime import date

# Re-Akkumulations-Ceilings (T7-K Teil 2). Bytes. Der Wächter soll ECHTES
# Wieder-Anschwellen fangen (STRUKTUR erreichte einst 452 KB, §1 Ist-Befund) — nicht
# bei jeder Session nörgeln. Darum liegt jedes Ceiling über der gesunden rotierten
# Grundlinie:
#  · STRUKTUR.md 60 KB = §3 T1 DoD; nach der Rotation ~37 KB → Wächter schweigt,
#    meldet erst echtes Re-Anschwellen.
#  · ROADMAP.md 100 KB = Ceiling mit Luft über der Nach-T7-Grundlinie (~94 KB, PR #173).
#    Das §3 T7 DoD-ZIEL «≤ ~65 KB» ist damit NOCH NICHT erreicht (weitere Chronik-
#    Auslagerung offen, s. FAHRPLAN-TOKEN-OEKONOMIE §Stand) — aber das ist T7-/ROADMAP-
#    Gebiet und kollidiert mit aktiven Parallel-Schreibern; der Wächter nörgelt darum
#    nicht auf dem bekannten Rest, sondern schlägt erst bei neuem Wachstum an.
BUDGET = {
    "STRUKTUR.md": 60 * 1024,
    "ROADMAP.md": 100 * 1024,
}
KARTEN_ANKER = "<!-- KARTEN -->"
ARCHIV = "archiv/STRUKTUR-SESSIONKARTEN.md"
# Karten älter als so viele ARBEITSTAGE (Mo–Fr) gegenüber der jüngsten Karte rotieren.
BEHALTE_ARBEITSTAGE = 2
SESSION_RE = re.compile(r"^## Session ", re.MULTILINE)
NICHT_SESSION_H2_RE = re.compile(r"^## (?!Session )", re.MULTILINE)
DATUM_RE = re.compile(r"^## Session (\d{1,2})\.(\d{1,2})\.(\d{4})")


def repo_dir():
    return os.environ.get("CLAUDE_PROJECT_DIR") or os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )


def git(repo, *args, timeout=20):
    return subprocess.run(
        ["git", *args], cwd=repo, capture_output=True, text=True, timeout=timeout
    )


def arbeitstage_abstand(fruehr: date, spaeter: date) -> int:
    """Zahl der Arbeitstage (Mo–Fr), die man von `fruehr` bis `spaeter` vorrückt."""
    if spaeter <= fruehr:
        return 0
    n = 0
    d = fruehr
    while d < spaeter:
        d = date.fromordinal(d.toordinal() + 1)
        if d.weekday() < 5:  # 0=Mo … 4=Fr
            n += 1
    return n


def parse_karten(struktur: str):
    """Zerlegt STRUKTUR.md in (kopf, karten[list[str]], schwanz).

    kopf   = alles bis zur ersten `## Session`-Karte (inkl. evtl. Anker).
    karten = die zusammenhängenden `## Session`-Blöcke, byte-genau (jeder Block
             läuft bis zum nächsten `## Session` bzw. bis zum ersten Nicht-Session-`## `).
    schwanz= Verweis-Abschnitt + Struktur-Sektionen ab dem ersten Nicht-Session-`## `.
    """
    m0 = SESSION_RE.search(struktur)
    if not m0:
        return struktur, [], ""
    erste = m0.start()
    # Schwanz beginnt beim ersten Nicht-Session-`## ` NACH der ersten Karte.
    schwanz_start = len(struktur)
    for m in NICHT_SESSION_H2_RE.finditer(struktur, erste):
        schwanz_start = m.start()
        break
    kopf = struktur[:erste]
    karten_region = struktur[erste:schwanz_start]
    schwanz = struktur[schwanz_start:]
    # karten_region in einzelne `## Session`-Blöcke schneiden (byte-genau).
    grenzen = [m.start() for m in SESSION_RE.finditer(karten_region)]
    karten = []
    for i, g in enumerate(grenzen):
        e = grenzen[i + 1] if i + 1 < len(grenzen) else len(karten_region)
        karten.append(karten_region[g:e])
    return kopf, karten, schwanz


def karten_datum(block: str):
    m = DATUM_RE.match(block)
    if not m:
        return None
    tag, monat, jahr = (int(x) for x in m.groups())
    try:
        return date(jahr, monat, tag)
    except ValueError:
        return None


def plane_rotation(struktur: str):
    """Gibt (behalten[list], rotieren[list], kopf, schwanz) zurück.

    Rotiert werden Karten, die > BEHALTE_ARBEITSTAGE gegenüber der jüngsten
    datierten Karte zurückliegen. Karten ohne parsebares Datum bleiben (konservativ).
    """
    kopf, karten, schwanz = parse_karten(struktur)
    datierte = [d for d in (karten_datum(k) for k in karten) if d]
    if not datierte:
        return karten, [], kopf, schwanz
    referenz = max(datierte)
    behalten, rotieren = [], []
    for k in karten:
        d = karten_datum(k)
        if d and arbeitstage_abstand(d, referenz) > BEHALTE_ARBEITSTAGE:
            rotieren.append(k)
        else:
            behalten.append(k)
    return behalten, rotieren, kopf, schwanz


def anker_einfuegen(kopf: str, behalten):
    """Setzt den KARTEN-Anker an den Anfang des Kartenblocks (idempotent)."""
    if KARTEN_ANKER in kopf or any(KARTEN_ANKER in b for b in behalten):
        return kopf + "".join(behalten)
    # Kopf endet auf Newline(s); Anker als eigener Absatz vor die erste Karte.
    return kopf + KARTEN_ANKER + "\n\n" + "".join(behalten)


def baue_neues_struktur(struktur: str):
    """(neuer_text, rotierte_blöcke) — oder (None, []) wenn nichts zu tun."""
    behalten, rotieren, kopf, schwanz = plane_rotation(struktur)
    anker_fehlt = KARTEN_ANKER not in kopf and not any(
        KARTEN_ANKER in b for b in behalten
    )
    if not rotieren and not anker_fehlt:
        return None, []
    neu = anker_einfuegen(kopf, behalten) + schwanz
    return neu, rotieren


def archiv_prepend(archiv_text: str, rotierte) -> str:
    """Hängt rotierte Blöcke byte-genau direkt unter den Archiv-Kopf (neueste zuerst)."""
    block = "".join(rotierte)
    m = SESSION_RE.search(archiv_text)
    if not m:
        # Kein bestehender Karten-Block: unter Kopf/Trenner anhängen.
        return archiv_text.rstrip("\n") + "\n\n" + block
    return archiv_text[: m.start()] + block + archiv_text[m.start() :]


def waechter_meldungen(repo):
    """Re-Akkumulations-Wächter (T7-K Teil 2): Steuer-Doks über Budget?"""
    out = []
    for name, budget in BUDGET.items():
        p = os.path.join(repo, name)
        try:
            groesse = os.path.getsize(p)
        except OSError:
            continue
        if groesse > budget:
            out.append(
                f"  - {name}: {groesse/1024:.1f} KB > Budget {budget/1024:.0f} KB "
                f"(+{(groesse-budget)/1024:.1f} KB)"
            )
    return out


def lese(repo, name):
    with open(os.path.join(repo, name), encoding="utf-8") as f:
        return f.read()


def schreibe(repo, name, text):
    with open(os.path.join(repo, name), "w", encoding="utf-8") as f:
        f.write(text)


def rotiere_und_schreibe(repo, commit: bool):
    """Führt die Rotation aus. Gibt (anzahl_rotiert, byte_bilanz_ok) zurück."""
    struktur = lese(repo, "STRUKTUR.md")
    neu, rotierte = baue_neues_struktur(struktur)
    if neu is None:
        return 0, True
    # Byte-Bilanz: die aus STRUKTUR entfernten Karten-Bytes == die ins Archiv
    # geschriebenen Karten-Bytes (Anker ist ein ZUSATZ-Marker, kein Inhalt).
    entfernt = sum(len(b.encode("utf-8")) for b in rotierte)
    archiv = lese(repo, ARCHIV)
    archiv_neu = archiv_prepend(archiv, rotierte)
    hinzugefuegt = len(archiv_neu.encode("utf-8")) - len(archiv.encode("utf-8"))
    bilanz_ok = entfernt == hinzugefuegt
    if rotierte and not bilanz_ok:
        raise RuntimeError(
            f"Byte-Bilanz verletzt: entfernt {entfernt} != hinzugefügt {hinzugefuegt}"
        )
    schreibe(repo, "STRUKTUR.md", neu)
    schreibe(repo, ARCHIV, archiv_neu)
    if commit:
        git(repo, "add", "--", "STRUKTUR.md", ARCHIV)
        git(
            repo,
            "commit",
            "-m",
            "docs(STRUKTUR): Session-Karten älter ~2 Arbeitstage byte-genau ins "
            "Archiv rotiert (QS-TOK/T1, automatisch)",
        )
    return len(rotierte), bilanz_ok


def sicherer_haupt_checkout(repo) -> bool:
    """K §3 T1: nur Haupt-Checkout (kein Worktree) UND git-clean."""
    try:
        gd = git(repo, "rev-parse", "--git-dir")
        gcd = git(repo, "rev-parse", "--git-common-dir")
        if gd.returncode or gcd.returncode:
            return False
        # Worktrees: git-dir != git-common-dir → No-op.
        if os.path.realpath(os.path.join(repo, gd.stdout.strip())) != os.path.realpath(
            os.path.join(repo, gcd.stdout.strip())
        ):
            return False
        status = git(repo, "status", "--porcelain")
        if status.returncode or status.stdout.strip():
            return False  # nur git-clean
        return True
    except Exception:
        return False


def modus_hook(repo):
    try:
        json.load(sys.stdin)  # SessionStart-Input konsumieren, Inhalt egal
    except Exception:
        pass
    # Rotation nur im sicheren Kontext; jeder Fehler ist still (nie stören).
    try:
        if os.environ.get("LEXMETRIK_NO_ROTATE"):
            pass
        elif sicherer_haupt_checkout(repo):
            rotiere_und_schreibe(repo, commit=True)
    except Exception:
        pass
    # Re-Akkumulations-Wächter: weicher Hinweis, blockiert NIE.
    try:
        meldungen = waechter_meldungen(repo)
    except Exception:
        meldungen = []
    if meldungen:
        hinweis = (
            "⚠️ Steuer-Doku-Budget überschritten (QS-TOK Re-Akkumulations-Wächter):\n"
            + "\n".join(meldungen)
            + "\n\nAbschluss-Prosa gehört DIREKT in die Chronik/ins Archiv "
            "(ROADMAP-CHRONIK.md bzw. archiv/STRUKTUR-SESSIONKARTEN.md), nicht in den "
            "Session-Einstieg. Rotation läuft automatisch nur im sauberen Haupt-Checkout; "
            "hier ggf. `npm run struktur:rotieren -- --write` und Karten/Chronik pflegen."
        )
        print(
            json.dumps(
                {
                    "hookSpecificOutput": {
                        "hookEventName": "SessionStart",
                        "additionalContext": hinweis,
                    }
                }
            )
        )
    sys.exit(0)


def modus_dry_run(repo):
    struktur = lese(repo, "STRUKTUR.md")
    behalten, rotieren, _, _ = plane_rotation(struktur)
    entfernt = sum(len(b.encode("utf-8")) for b in rotieren)
    print(f"STRUKTUR.md: {len(struktur.encode('utf-8'))/1024:.1f} KB")
    print(f"  Karten gesamt: {len(behalten) + len(rotieren)}")
    print(f"  behalten:      {len(behalten)}")
    print(f"  rotieren:      {len(rotieren)}  ({entfernt/1024:.1f} KB)")
    for b in rotieren:
        kopf = b.splitlines()[0] if b.splitlines() else "?"
        print(f"    → {kopf[:90]}")
    rest = len(struktur.encode("utf-8")) - entfernt
    print(f"  STRUKTUR.md danach: ~{rest/1024:.1f} KB (Budget {BUDGET['STRUKTUR.md']/1024:.0f} KB)")
    sys.exit(0)


def modus_write(repo):
    struktur_vorher = len(lese(repo, "STRUKTUR.md").encode("utf-8"))
    n, ok = rotiere_und_schreibe(repo, commit=False)
    struktur_nachher = len(lese(repo, "STRUKTUR.md").encode("utf-8"))
    print(f"rotiert: {n} Karte(n); Byte-Bilanz {'OK' if ok else 'VERLETZT'}")
    print(
        f"STRUKTUR.md: {struktur_vorher/1024:.1f} KB → {struktur_nachher/1024:.1f} KB "
        f"(Budget {BUDGET['STRUKTUR.md']/1024:.0f} KB)"
    )
    sys.exit(0)


def modus_check(repo):
    meldungen = waechter_meldungen(repo)
    if meldungen:
        print("Re-Akkumulations-Wächter ROT:")
        for m in meldungen:
            print(m)
        sys.exit(1)
    print("Re-Akkumulations-Wächter grün (Steuer-Doks im Budget).")
    sys.exit(0)


def main():
    repo = repo_dir()
    args = sys.argv[1:]
    if "--hook" in args:
        modus_hook(repo)
    elif "--dry-run" in args:
        modus_dry_run(repo)
    elif "--write" in args:
        modus_write(repo)
    elif "--check" in args:
        modus_check(repo)
    else:
        print(__doc__)
        sys.exit(0)


if __name__ == "__main__":
    main()
