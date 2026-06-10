#!/usr/bin/env bash
# ─── Bibliotheks-Standard-Check (bibliothek/STANDARDS.md S10) ────────────────
# Maschinell prüfbare Mindeststandards; Exit 1 bei Verstoss. Teil des
# §9-Bug-Checks, wenn ein Deploy Bibliotheks-Änderungen enthält.
#   bash scripts/bibliothek-check.sh
set -u
cd "$(dirname "$0")/../bibliothek" || exit 1
fehler=0
melde() { echo "VERSTOSS [$1] $2"; fehler=$((fehler+1)); }

# ── S7.1: jede Datei hat ihre INDEX-Zeile ───────────────────────────────────
for f in recherche/*.md; do
  b=$(basename "$f"); [ "$b" = "INDEX.md" ] && continue
  grep -q "($b)" recherche/INDEX.md || melde S7 "recherche/INDEX.md ohne Zeile für $b"
done
for f in behoerden/*.md kosten/*.md normen/*.md rechtsprechung/*.md register/*.md muster/MANIFEST.md STANDARDS.md; do
  b=$(basename "$f")
  grep -q "$b" INDEX.md || melde S7 "Haupt-INDEX ohne Eintrag für $f"
done

# ── S7.3: relative MD-Links lösen auf ───────────────────────────────────────
grep -rhoE '\]\([a-zA-Z0-9./_-]+\.md\)' --include="*.md" . \
  | sed -E 's/\]\((.*)\)/\1/' | sort -u | while read -r l; do
  ok=0
  for base in . recherche behoerden normen kosten register rechtsprechung muster; do
    [ -f "$base/$l" ] && ok=1 && break
  done
  [ "$ok" = "0" ] && echo "VERSTOSS [S7] toter Link: $l"
done | tee /tmp/bibcheck-links.txt
[ -s /tmp/bibcheck-links.txt ] && fehler=$((fehler+$(wc -l < /tmp/bibcheck-links.txt)))

# ── S1: Pflichtkopf (Erstellt/Datum + Status) in Fach-Dossiers ──────────────
for f in recherche/*.md behoerden/*.md kosten/*.md normen/*.md; do
  b=$(basename "$f"); [ "$b" = "INDEX.md" ] && continue
  kopf=$(head -30 "$f")
  echo "$kopf" | grep -qiE '\*\*(Erstellt|Datum|Stand)\b' || melde S1 "$f ohne Erstellt-/Datums-Zeile im Kopf"
  echo "$kopf" | grep -qiE '\bStatus\b' || melde S1 "$f ohne Status-Zeile im Kopf"
done

# ── S4: /tmp nur für Fedlex-Caches + deklarierte Cache-Ableitungen ──────────
# Whitelist aus fedlex-cache.sh (Gesetzes-Caches) + Norm-Extrakt-Arbeitskopien.
WHITELIST='or|zgb|zpo|schkg|arg|vmwg|stpo|vwvg|bgg|vvg|hregv|gebv_hreg|gebv_schkg|stg|stgb'
grep -rnoE '/tmp/[a-zA-Z0-9._-]+' --include="*.md" . | grep -vE "/tmp/(${WHITELIST})\.html" \
  | grep -vE '/tmp/(gruendung|kaperh)[a-z0-9_-]*-extrakt2?\.txt' \
  | grep -v 'muster/' \
  | tee /tmp/bibcheck-tmp.txt
[ -s /tmp/bibcheck-tmp.txt ] && { echo "VERSTOSS [S4] /tmp-Verweise ausserhalb der Cache-Whitelist (oben)"; fehler=$((fehler+$(wc -l < /tmp/bibcheck-tmp.txt))); }

# ── S6: «Verfallsregister-Kandidat»-Marker müssen registriert sein ──────────
# Geschärft 10.6.2026 (FAHRPLAN-GRUNDLAGEN G4.1): FEHLER statt Warnung.
# Mechanik: Wer den Marker trägt, muss mit seinem Dateinamen in
# register/parameter-verfall.md auftauchen (Fundstellen-Spalte verlinkt das
# Dossier). Historische Marker ohne Registereintrag sind damit Verstösse.
grep -rln "Verfallsregister-Kandidat" --include="*.md" recherche behoerden normen kosten 2>/dev/null | while read -r f; do
  b=$(basename "$f")
  grep -q "$b" register/parameter-verfall.md \
    || echo "VERSTOSS [S6] $f trägt Kandidat-Marker, aber register/parameter-verfall.md nennt $b nicht"
done | tee /tmp/bibcheck-s6.txt
[ -s /tmp/bibcheck-s6.txt ] && fehler=$((fehler+$(wc -l < /tmp/bibcheck-s6.txt)))

if [ "$fehler" -gt 0 ]; then
  echo; echo "❌ ${fehler} Standard-Verstoss/-Verstösse — STANDARDS.md S1/S4/S6/S7 prüfen."
  exit 1
fi
echo; echo "✅ Bibliothek erfüllt die maschinell prüfbaren Mindeststandards (S1, S4, S6, S7)."
