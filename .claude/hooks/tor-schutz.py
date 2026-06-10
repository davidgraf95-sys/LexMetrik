#!/usr/bin/env python3
"""PreToolUse-Hook (Bash): blockiert die zwei teuersten Unfall-Muster.

1. Tor-Kommandos (Lint/Test/tsc/Golden/Check) durch Pipes jagen —
   Pipes verschlucken den Exit-Code (real passiert: 8 Lint-Fehler und
   eine Golden-Abweichung gingen so verloren).
2. git commit --amend — hat bei laufender Parallel-Session einen
   fremden Commit umgeschrieben. Nur additive Commits.

Exit 2 = Aufruf blockieren, stderr geht als Feedback an Claude.
"""
import json
import re
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

if probleme:
    print("\n".join(probleme), file=sys.stderr)
    sys.exit(2)

sys.exit(0)
