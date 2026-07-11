#!/usr/bin/env python3
"""STRUKTUR.md-Lag-Audit — On-Demand (Auftrag David 22.6.2026; entkoppelt QS-TOK/T19).

Misst, wie weit STRUKTUR.md hinter HEAD zurückliegt, und meldet substanzielle
Commits, für die noch keine Session-Karte gezogen wurde.

**T19 (Prompt-Cache-Hygiene, 11.7.2026):** Dieser Check lief früher als
SessionStart-Hook und injizierte die Meldung bei JEDEM Sitzungsstart als
`additionalContext`. Weil die Meldung git-zustandsabhängig (Commit-Zahl + -Liste)
und damit byte-INSTABIL ist, machte sie den SessionStart-Präfix in jeder Session
verschieden und verhinderte den Prompt-Cache-Treffer. Ab T19 ist die Warn-
Injektion aus der SessionStart-Kette ENTFERNT (`.claude/settings.json`); die
Schutzfunktion (STRUKTUR.md aktuell halten) trägt jetzt mechanisch
`struktur-rotieren.py` (T1: rotiert Karten byte-genau + committet `docs(STRUKTUR…)`,
rückt damit die Basis nach + Re-Akkumulations-Wächter). Dieses Skript bleibt als
**On-Demand-Audit** erhalten: `npm run struktur:aktuell` (bzw. direkt aufrufen)
druckt dieselbe Lag-Analyse, ohne den Sitzungs-Präfix zu belasten.

Ausgabe: bei SessionStart-Input (JSON auf stdin) das `hookSpecificOutput`-JSON
wie bisher; bei manuellem Lauf ohne stdin dieselbe Analyse. Kein Lag → still.

Mechanik:
- Basis = jüngster Commit, der STRUKTUR.md berührt hat.
- Relevante Lücke = Nicht-Merge-Commits in basis..HEAD, deren Subject NICHT mit
  `docs(STRUKTUR` beginnt (reine Karten-Pflege zählt nicht als undokumentiert).
- Lücke > 0 → additionalContext mit der Commit-Liste; Pflegeregel zitiert.
- git nicht verfügbar / kein Stand / Fehler → still Exit 0 (nie stören).
"""
import json
import os
import subprocess
import sys


def git(repo, *args, timeout=15):
    return subprocess.run(
        ["git", *args], cwd=repo, capture_output=True, text=True, timeout=timeout
    )


def main():
    # SessionStart liefert JSON auf stdin; beim manuellen Lauf (npm run
    # struktur:aktuell) ist stdin ein TTY/leer — dann nicht blockierend lesen.
    if not sys.stdin.isatty():
        try:
            json.load(sys.stdin)  # Input konsumieren, Inhalt egal
        except Exception:
            pass

    repo = os.environ.get("CLAUDE_PROJECT_DIR") or os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )

    try:
        base = git(repo, "log", "-1", "--format=%H", "--", "STRUKTUR.md")
        if base.returncode != 0 or not base.stdout.strip():
            sys.exit(0)
        basis = base.stdout.strip()

        log = git(
            repo, "log", "--no-merges", "--format=%h %s", f"{basis}..HEAD"
        )
        if log.returncode != 0:
            sys.exit(0)
    except Exception:
        sys.exit(0)

    luecke = [
        z
        for z in log.stdout.splitlines()
        if z.strip() and not z.split(" ", 1)[-1].startswith("docs(STRUKTUR")
    ]
    if not luecke:
        sys.exit(0)

    liste = "\n".join(f"  - {z}" for z in luecke[:30])
    mehr = "" if len(luecke) <= 30 else f"\n  … und {len(luecke) - 30} weitere."
    hinweis = (
        "⚠️ STRUKTUR.md hängt dem Code hinterher: "
        f"{len(luecke)} substanzielle Commit(s) seit der letzten Pflege "
        "der Session-Karten sind NICHT in STRUKTUR.md dokumentiert.\n"
        f"{liste}{mehr}\n\n"
        "STRUKTUR.md ist laut CLAUDE.md der erste Anlaufpunkt für den "
        "aktuellen Stand. Bevor du auf diesem Stand weiterbaust: prüfe diese "
        "Commits und ziehe — falls noch nicht geschehen — eine ehrliche "
        "Session-Karte oben in STRUKTUR.md nach (Pflegeregel Session-Karten; "
        "§8 Ehrlichkeit, Deploy-Status nie schönreden). Stammen die Commits "
        "aus einer Parallel-/Autonom-Session (§12), genügt das Nachtragen der "
        "Karte — nicht erneut umsetzen."
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


if __name__ == "__main__":
    main()
