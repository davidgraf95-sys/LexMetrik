#!/usr/bin/env bash
# ─── Vertragstests der Runtime-APIs (QS-OPT O-1.8) ──────────────────────────
# ZefixSuche.tsx und AdresseBundSuche.tsx hängen an externen Runtime-APIs
# (www.zefix.ch, api3.geo.admin.ch). Kein Tor prüfte bisher deren Schema — eine
# stille Feld-Umbenennung ginge als «keine Treffer» durch (§8-Verstoss). Diese
# fixen Beispielabfragen prüfen Erreichbarkeit UND die konsumierten Felder.
set -uo pipefail
fail=0

echo "Runtime-API-Vertragstests:"

# ── Zefix: Firmensuche (POST, wie ZefixSuche.tsx) ───────────────────────────
# Konsumierte Felder: list[].{name, ehraid, uidFormatted, legalSeat, status}.
zefix="$(curl -sS --max-time 25 --retry 3 --retry-delay 3 --retry-all-errors \
  -X POST 'https://www.zefix.ch/ZefixREST/api/v1/firm/search.json' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Nestle","activeOnly":true}' 2>/dev/null)" || { echo "  ROT  Zefix — curl-Fehler"; fail=1; }

if [ -n "${zefix:-}" ]; then
  if echo "$zefix" | jq -e '
      (.list | type == "array") and (.list | length >= 1) and
      (.list[0] | has("name") and has("ehraid") and has("uidFormatted")
        and has("legalSeat") and has("status"))
    ' >/dev/null 2>&1; then
    echo "  ok   Zefix — Schema (name/ehraid/uidFormatted/legalSeat/status) vorhanden"
  else
    echo "  ROT  Zefix — Antwort ohne erwartete Felder (Schema-Drift?):"
    echo "$zefix" | head -c 400; echo
    fail=1
  fi
fi

# ── geo.admin.ch: Adresssuche (GET, wie AdresseBundSuche.tsx) ───────────────
# Konsumierte Felder: results[].attrs.{label, featureId}.
geo="$(curl -sS --max-time 25 --retry 3 --retry-delay 3 --retry-all-errors \
  'https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Bundesplatz%203%20Bern&type=locations&origins=address&limit=6' 2>/dev/null)" \
  || { echo "  ROT  geo.admin.ch — curl-Fehler"; fail=1; }

if [ -n "${geo:-}" ]; then
  if echo "$geo" | jq -e '
      (.results | type == "array") and (.results | length >= 1) and
      (.results[0].attrs | has("label") and has("featureId"))
    ' >/dev/null 2>&1; then
    echo "  ok   geo.admin.ch — Schema (results[].attrs.label/featureId) vorhanden"
  else
    echo "  ROT  geo.admin.ch — Antwort ohne erwartete Felder (Schema-Drift?):"
    echo "$geo" | head -c 400; echo
    fail=1
  fi
fi

if [ "$fail" -ne 0 ]; then
  echo "API-VERTRAGSTESTS ROT — Runtime-API ausgefallen oder Schema gedriftet."
  exit 1
fi
echo "API-VERTRAGSTESTS GRÜN."
