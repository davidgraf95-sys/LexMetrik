#!/usr/bin/env bash
# scripts/gate.sh — Prüf-Gates: leise bei Grün, volle Ausgabe nur bei Rot.
# Aufruf:  npm run gate          (volle Fünferkette)
#          npm run gate:schnell  (nur tsc · vitest · golden, ~7 s)
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

mode="${1:-voll}"
fail=0

run() {
  local name="$1"; shift
  local log code
  log="$("$@" 2>&1)"; code=$?
  if [ "$code" -eq 0 ]; then
    printf '  ok   %s\n' "$name"
  else
    fail=1
    printf '  ROT  %s (exit %s)\n' "$name" "$code"
    printf '%s\n' "$log"   # volle Ausgabe NUR für das rote Gate
  fi
}

echo "Gates (${mode}):"
run "tsc -b"            npx tsc -b
run "vitest"            npm test
run "golden:vergleich"  npm run golden:vergleich
if [ "$mode" = "voll" ]; then
  run "lint"   npm run lint
  run "check"  npm run check
fi

if [ "$fail" -ne 0 ]; then
  echo "GATE ROT — Ursache im Code beheben. Kein 'npm run golden', Test nicht aufweichen (§6 Ziff. 3)."
  exit 1
fi
echo "GATE GRÜN."
exit 0
