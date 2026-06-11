#!/usr/bin/env python3
"""Stop-Hook (FAHRPLAN-TOKEN-DISZIPLIN.md T-2, Ja David 11.6.2026): fährt
das schnelle Tor (tsc · vitest · golden:vergleich via scripts/gate.sh
schnell) NATIV nach jeder Antwort, wenn tor-relevante Dateien geändert sind.

- GRÜN  → Exit 0, nichts gelangt in den Kontext (0 Tokens).
- ROT   → Exit 2, das Stoppen wird EINMAL blockiert und die volle
          Tor-Ausgabe geht als Feedback an Claude (volle Fidelity, §6).
          stop_hook_active verhindert die Endlosschleife: nach einem Block
          darf die Session beim nächsten Stopp enden (Rot ist dann bereits
          berichtet).
- Keine relevanten Änderungen / git nicht verfügbar → Exit 0 (still).
"""
import json
import os
import subprocess
import sys

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

# Loop-Guard: dieser Stopp folgt bereits auf einen Hook-Block dieses Turns.
if data.get("stop_hook_active"):
    sys.exit(0)

repo = os.environ.get("CLAUDE_PROJECT_DIR") or os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)

# Nur prüfen, wenn tor-relevante Dateien im Arbeitsverzeichnis geändert sind
# (Pfadliste = Wartungsregel 2 in FAHRPLAN-TOKEN-DISZIPLIN.md).
PFADE = ["src", "scripts", "package.json", "vite.config.ts",
         "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json"]
try:
    st = subprocess.run(
        ["git", "status", "--porcelain", "--", *PFADE],
        cwd=repo, capture_output=True, text=True, timeout=15,
    )
except Exception:
    sys.exit(0)
if st.returncode != 0 or not st.stdout.strip():
    sys.exit(0)

try:
    gate = subprocess.run(
        ["bash", "scripts/gate.sh", "schnell"],
        cwd=repo, capture_output=True, text=True, timeout=240,
    )
except Exception as e:
    print(f"gate-stopp.py: Tor-Lauf fehlgeschlagen ({e}) — bitte "
          f"`npm run gate:schnell` von Hand fahren.", file=sys.stderr)
    sys.exit(2)

if gate.returncode == 0:
    sys.exit(0)

print(
    "STOP-HOOK: gate:schnell ist ROT (automatischer Lauf nach deiner "
    "Antwort; Änderungen in tor-relevanten Dateien liegen vor).\n\n"
    + gate.stdout + gate.stderr +
    "\nUrsache im Code beheben (§6: kein `npm run golden`, Tests nicht "
    "aufweichen; Diagnose nach §6 Ziff. 5 — rote Datei gezielt, "
    "golden:diff je Fall). Stammt der Bruch NICHT von deiner Änderung "
    "(§12 Parallel-Session): nicht hineinfixen, sondern David den Befund "
    "melden und stoppen.",
    file=sys.stderr,
)
sys.exit(2)
