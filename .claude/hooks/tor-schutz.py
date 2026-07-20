#!/usr/bin/env python3
"""PreToolUse-Hook (Bash): blockiert die drei teuersten Unfall-Muster.

1. Tor-Kommandos (Lint/Test/tsc/Golden/Check) durch Pipes jagen —
   Pipes verschlucken den Exit-Code (real passiert: 8 Lint-Fehler und
   eine Golden-Abweichung gingen so verloren).
2. git commit --amend — hat bei laufender Parallel-Session einen
   fremden Commit umgeschrieben. Nur additive Commits.
3. `gh pr merge` auf einem Risiko-Pfad ohne Gegenprüfungs-Verdikt
   (Vorfall PR #309, 20.7.2026: 11 erfundene Amtsträger:innen ~1 h auf
   prod). Prosa hätte #309 NICHT verhindert — der Agent hat korrekt
   befolgt, was im Auftrag stand. Nur die Tool-Ebene greift auch dann,
   wenn die Merge-Erlaubnis im falschen Prompt-Block steht, und auch in
   Sub-Agenten, die CLAUDE.md gar nicht sehen.

Prompt-Cache (QS-TOK/T19): PreToolUse liegt AUSSERHALB des gecachten
Präfix — dieser Hook kostet bei Grün 0 Token und keine Cache-Invalidierung.

Exit 2 = Aufruf blockieren, stderr geht als Feedback an Claude.
"""
import json
import os
import re
import subprocess
import sys

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

cmd = (data.get("tool_input") or {}).get("command", "")
if not cmd:
    sys.exit(0)

probleme = []

TOR_MUSTER = re.compile(
    r"npm run lint|npm test\b|npx vitest|npx tsc|golden:vergleich"
    r"|golden-outputs|npm run check|npm run golden"
)
# je Segment (getrennt durch && ; oder Zeilenende) prüfen, ob nach einem
# Tor-Kommando noch eine Pipe folgt; '||' fängt auch das Schlucken via '|| true'
for seg in re.split(r"&&|;|\n", cmd):
    m = TOR_MUSTER.search(seg)
    if m and "|" in seg[m.end():]:
        probleme.append(
            "BLOCKIERT (§6/§9): Tor-Kommando durch Pipe/|| gejagt — der "
            "Exit-Code wird verschluckt (Lektion vom 6./7.6.: 8 Lint-Fehler "
            "bzw. eine Golden-Abweichung gingen so verloren). Kommando NACKT "
            "laufen lassen und die volle Ausgabe lesen."
        )
        break

if re.search(r"git\s+commit\b[^\n]*--amend", cmd):
    probleme.append(
        "BLOCKIERT: git commit --amend ist in diesem Repo verboten "
        "(Lektion 6.6.: hat bei laufender Parallel-Session einen fremden "
        "Commit umgeschrieben). Nachzügler als eigenen, additiven Commit."
    )

# ── 3. Merge-Sperre auf Risiko-Pfaden ──────────────────────────────────
# Nur bei Merge-Kommandos (selten) — die ~3 s Laufzeit fallen sonst nie an.
#
# BEFUND adversariale Pruefung 20.7.2026: die erste Fassung traf nur
# /\bgh\s+pr\s+merge\b/. Zwei belegte Umgehungen blieben offen:
#   (a) `gh api -X PUT repos/o/r/pulls/315/merge --field merge_method=squash`
#       passierte den Hook mit Exit 0 bei rotem Tor.
#   (b) `gh pr merge --auto` prueft den Stand im Moment des AKTIVIERENS;
#       danach gepushte Risiko-Commits merged GitHub serverseitig, ohne dass
#       je wieder ein Bash-Aufruf und damit dieser Hook laeuft.
# (a) ist unten mitgefasst. (b) ist mit einem PreToolUse-Hook strukturell
# nicht schliessbar — darum wird `--auto` auf Risikopfaden GANZ gesperrt und
# auf den nachgelagerten Merge nach gruener CI verwiesen. Der eigentliche
# Schliesser bleibt der Required Check in den Branch-Regeln (DAVID-GATE).
MERGE_MUSTER = re.compile(
    r"\bgh\s+pr\s+merge\b"                       # gh pr merge …
    r"|\bgh\s+api\b[^\n]*?/(?:pulls|merges)\b"   # gh api …/pulls/N/merge, …/merges
    r"|\bgh\s+api\b[^\n]*?\bmerge\b"
)
if MERGE_MUSTER.search(cmd):
    projekt = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
    try:
        p = subprocess.run(
            ["npm", "run", "--silent", "check:merge-schutz"],
            cwd=projekt, capture_output=True, text=True, timeout=120,
        )
        if p.returncode != 0:
            probleme.append(
                "BLOCKIERT (§9/§14 Ziff. 4): Merge auf einem Risiko-Pfad ohne "
                "Gegenprüfungs-Verdikt.\n\n" + (p.stdout or p.stderr).strip()
            )
        elif re.search(r"--auto\b", cmd):
            # Tor ist JETZT grün — aber `--auto` merged erst spaeter, ohne
            # erneute Pruefung. Auf Risikopfaden ist das die Luecke aus
            # Befund (b): ein danach gepushter Risiko-Commit faehrt
            # ungeprueft auf prod.
            risiko = subprocess.run(
                ["npm", "run", "--silent", "check:merge-schutz"],
                cwd=projekt, capture_output=True, text=True, timeout=120,
            ).stdout
            if "kein Risiko-Pfad" not in risiko:
                probleme.append(
                    "BLOCKIERT (§9): `--auto` auf einem Risiko-Pfad.\n\n"
                    "  Auto-Merge prueft den Stand nur JETZT. Jeder danach "
                    "gepushte Risiko-Commit wird serverseitig gemergt, ohne "
                    "dass dieses Tor je wieder laeuft.\n"
                    "  Weg: CI gruen abwarten, dann OHNE --auto mergen.\n"
                    "  (Davids Daueranweisung 'Auto-merge bei gruener CI' "
                    "bleibt fuer alle Nicht-Risiko-PRs unveraendert.)"
                )
    except Exception as e:  # noqa: BLE001
        # Fail-closed: kann das Tor nicht laufen, wird NICHT durchgewinkt.
        # Ein Tor, das bei Störung still grün wird, ist kein Tor (§6 Ziff. 7).
        probleme.append(
            f"BLOCKIERT: check:merge-schutz konnte nicht laufen ({e}). "
            "Merge nicht freigegeben — erst das Tor lauffähig machen "
            "(`npm run check:merge-schutz`), dann erneut."
        )

if probleme:
    print("\n".join(probleme), file=sys.stderr)
    sys.exit(2)

sys.exit(0)
