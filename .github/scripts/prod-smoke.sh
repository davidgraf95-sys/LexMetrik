#!/usr/bin/env bash
# ─── Prod-Smoke der Live-Site (QS-OPT O-1.2 + O-1.4) ─────────────────────────
# Prüft lexmetrik.vercel.app strukturell: Startseite lebt (200+HTML), /api/suche
# antwortet ehrlich (JSON, nie HTML-Shell), je 1 Korpus-JSON ist erreichbar +
# korrekt typisiert, und ein fehlender Daten-Pfad gibt eine ECHTE 404 (Soft-404
# beendet, O-1.4) statt der 200-HTML-Shell. Fängt dauerhaft die Klasse «totes
# Feature / maskierter Datenfehler blieb unbemerkt».
set -uo pipefail

PROD="${PROD_URL:-https://lexmetrik.vercel.app}"
fail=0

# curl mit Retry gegen transiente Netzfehler; gibt "<code>\t<content_type>" aus.
probe() { # url
  curl -sS --max-time 25 --retry 3 --retry-delay 3 --retry-all-errors \
    -o /tmp/smoke_body -w '%{http_code}\t%{content_type}' "$1" 2>/dev/null
}

erwarte() { # label url status-regex content-type-substr
  local label="$1" url="$2" want_code="$3" want_ct="$4" out code ct
  out="$(probe "$url")" || { echo "  ROT  $label — curl-Fehler ($url)"; fail=1; return; }
  code="${out%%$'\t'*}"; ct="${out#*$'\t'}"
  if ! [[ "$code" =~ $want_code ]]; then
    echo "  ROT  $label — HTTP $code (erwartet $want_code) $url"; fail=1; return
  fi
  if [ -n "$want_ct" ] && [[ "$ct" != *"$want_ct"* ]]; then
    echo "  ROT  $label — Content-Type '$ct' (erwartet *$want_ct*) $url"; fail=1; return
  fi
  echo "  ok   $label — HTTP $code · $ct"
}

echo "Prod-Smoke gegen $PROD:"

# Startseite: prerenderte HTML-Seite, 200.
erwarte "Startseite" "$PROD/" '^200$' 'text/html'

# /api/suche: MUSS JSON sein (nie HTML-Shell). 200 (aktiv) ODER 503 (ehrlich
# degradiert, Turso nicht provisioniert) sind beide gesund; 200+HTML wäre der Bug.
erwarte "/api/suche" "$PROD/api/suche?q=vertrag&limit=1" '^(200|503)$' 'application/json'

# Je 1 Stichproben-JSON pro Korpus: erreichbar + application/json.
erwarte "normtext/register.json"        "$PROD/normtext/register.json"        '^200$' 'application/json'
erwarte "rechtsprechung/register.json"  "$PROD/rechtsprechung/register.json"  '^200$' 'application/json'
erwarte "materialien/register.json"     "$PROD/materialien/register.json"     '^200$' 'application/json'
erwarte "such-index/artikel-bund.json"  "$PROD/such-index/artikel-bund.json"  '^200$' 'application/json'

# Soft-404-Signal (O-1.4): ein fehlender Daten-Pfad MUSS 404 geben, nicht die
# 200-HTML-Shell. Deckt das negative Rewrite-Muster in vercel.json ab.
erwarte "Soft-404 (fehlende Datei)" "$PROD/normtext/existiert-nicht-o1-smoke.json" '^404$' ''

if [ "$fail" -ne 0 ]; then
  echo "PROD-SMOKE ROT — Live-Site/Datenpfad defekt."
  exit 1
fi
echo "PROD-SMOKE GRÜN."
