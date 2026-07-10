#!/usr/bin/env bash
# scripts/ci-log-diaet.sh — CI-Rot-Log-Diät, Stufe 1 (QS-TOK P4 · T12, Risiko 0).
#
# Zweck (Token-Ökonomie): `gh run view --log-failed` liefert nur die fehlgeschlagenen
# Jobs — aber jede Zeile trägt ein identisches Präfix `<Job>⇥<Step>⇥<ISO-Zeitstempel>`
# (~90 Zeichen reines Rauschen je Zeile) plus ANSI-Codes. Diese Diät entfernt NUR dieses
# mechanische Präfix + ANSI + BOM und gruppiert nach Job/Step. Der **Fehlertext bleibt
# vollständig** (§6-Sinn: kein verstecktes Versagen) — es wird nichts gefiltert, nur
# ent-präfixt. Zusätzlich ein kompakter Kopf (welcher Job/Step, welche `##[error]`-Zeilen).
#
# Stufe 2 (CI-Job-Split) bewusst NICHT gebaut — siehe FAHRPLAN §6/T12:
# T2-Baseline zeigt Output-Anteil 0,54 % (cacheRead 95,8 % dominiert), die
# Risiko-Asymmetrie-Bedingung «materielle Rest-Kosten» ist damit NICHT erfüllt.
#
# Aufruf:
#   npm run ci:log                 → jüngster fehlgeschlagener Run des aktuellen Branch
#   npm run ci:log -- <run-id>     → bestimmter Run
#   npm run ci:log -- --roh <id>   → zusätzlich das rohe --log-failed (Vergleich/Beleg)
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

roh=0
run_id=""
for arg in "$@"; do
  case "$arg" in
    --roh) roh=1 ;;
    *) run_id="$arg" ;;
  esac
done

if ! command -v gh >/dev/null 2>&1; then
  echo "ci-log-diaet: gh CLI fehlt." >&2
  exit 1
fi

# Ohne Run-ID: jüngsten fehlgeschlagenen Run des aktuellen Branch nehmen.
if [ -z "$run_id" ]; then
  branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
  run_id="$(gh run list --branch "$branch" --status failure --limit 1 \
              --json databaseId --jq '.[0].databaseId' 2>/dev/null)"
  if [ -z "$run_id" ] || [ "$run_id" = "null" ]; then
    echo "ci-log-diaet: kein fehlgeschlagener Run für Branch '${branch}' gefunden." >&2
    exit 1
  fi
  echo "ci-log-diaet: jüngster roter Run für '${branch}' = ${run_id}" >&2
fi

log="$(gh run view "$run_id" --log-failed 2>/dev/null)"
if [ -z "$log" ]; then
  echo "ci-log-diaet: --log-failed leer (Run ${run_id} evtl. nicht rot oder Logs verfallen)." >&2
  exit 1
fi

roh_bytes="$(printf '%s' "$log" | wc -c | tr -d ' ')"

# Ent-Rauschen (portabel via perl, macOS + Linux):
#   1) Präfix «Job⇥Step⇥» entfernen, Job/Step in $JOB/$STEP festhalten (Gruppen-Trenner);
#   2) führenden ISO-Zeitstempel entfernen;
#   3) ANSI-Codes + BOM entfernen.
# Der Inhalt (Fehlertext) bleibt vollständig.
diaet="$(printf '%s\n' "$log" | perl -ne '
  s/\r$//;
  if (/^([^\t]*)\t([^\t]*)\t(.*)$/s) { $job=$1; $step=$2; $_=$3; }
  if ("$job\t$step" ne $seen) { print "\n── $job / $step ──\n"; $seen="$job\t$step"; }
  s/\xef\xbb\xbf//g;                 # BOM (zuerst — steht vor dem Zeitstempel)
  s/^[0-9T:.\-]+Z ?//;              # führender ISO-Zeitstempel
  s/\x1b\[[0-9;]*[mGKH]//g;          # ANSI (echtes ESC-Byte)
  s/\^\[\[[0-9;]*[mGKH]//g;           # ANSI als Caret-Notation «^[[..m» (gh-Log-Form)
  print;
')"
diaet_bytes="$(printf '%s' "$diaet" | wc -c | tr -d ' ')"

echo "════ CI-Rot-Diät · Run ${run_id} ════"
printf '%s\n' "$log" | perl -ne 'if (/^([^\t]*)\t([^\t]*)\t/) { $k="$1 / $2"; if ($k ne $s){print "  • $k\n"; $s=$k} }'
echo "──── ##[error]-Zeilen (schneller Zeiger) ────"
printf '%s\n' "$diaet" | grep -a '##\[error\]' | sed 's/##\[error\]//' | head -40
echo "════════ Voller Fehler-Log (ent-präfixt, ungekürzt) ════════"
printf '%s\n' "$diaet"
echo >&2 "ci-log-diaet: roh ${roh_bytes} B → ent-präfixt ${diaet_bytes} B (Fails vollständig)."

if [ "$roh" -eq 1 ]; then
  echo "════════ ROH (--log-failed, Beleg) ════════"
  printf '%s\n' "$log"
fi
