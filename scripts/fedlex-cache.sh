#!/usr/bin/env bash
# ─── Fedlex-Cache: konsolidierte Filestore-HTMLs laden + Anker prüfen ────────
#
# Reproduzierbare §7-Verifikation: lädt die konsolidierten Fassungen der von
# LexMetrik verwendeten Gesetze nach /tmp (Caches überleben Neustarts nicht)
# und prüft das Anker-Inventar. Konsolidierungsdaten = die im Quellen-Register
# (bibliothek/register/quellen-register.md) dokumentierten, verifizierten Stände —
# bei Rechtsänderungen dort UND hier nachführen.
#
# Aufruf:  bash scripts/fedlex-cache.sh
set -u

BASIS="https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli"

# gesetz|eli|konsolidierung|html-N|pflicht-anker (kommagetrennt)
EINTRAEGE=(
  "or|cc/27/317_321_377|20260101|4|art_11,art_32,art_77,art_104,art_216,art_324_a,art_335_c,art_336_c,art_396,art_493"
  "zgb|cc/24/233_245_233|20260101|4|art_19_c,art_360,art_361,art_370,art_467,art_505"
  # ZPO-Anker um die Rechtsmittel-Artikel erweitert (Umbau 6.6.2026).
  "zpo|cc/2010/262|20250101|1|art_4,art_6,art_68,art_145,art_197,art_198,art_199,art_210,art_212,art_243,art_308,art_314,art_319,art_321"
  # SchKG-Anker um die Zuständigkeits-Karten-Pillen erweitert (Katalog-Split 6.6.2026).
  "schkg|cc/11/529_488_529|20250101|1|art_17,art_46,art_56,art_63,art_84,art_272"
  "arg|cc/1966/57_57_57|20230901|1|art_9,art_12,art_13,art_46"
  # VMWG: 20251001-Filestore nicht abrufbar (nur SPA-Shell); 20250101 ist der
  # letzte greifbare Stand. art_19_a existiert dort NICHT (nur art_19) —
  # Diskrepanz zur fedlex.ts-Notiz, siehe quellen-register.md.
  "vmwg|cc/1990/835_835_835|20250101|1|art_16,art_17,art_19"
  # StPO-Anker um die Straf-Zuständigkeits-Pillen erweitert (6.6.2026).
  "stpo|cc/2010/267|20240101|1|art_31,art_129,art_301,art_379"
  "vwvg|cc/1969/737_757_755|20210101|1|art_11"
  # BGG: bisher Ad-hoc-Cache — seit 6.6.2026 reproduzierbar gepinnt (html-1
  # empirisch bestätigt, 196 kB; Grundlage bestimmeRechtsmittel + Dossier
  # bibliothek/recherche/bgg-beschwerde-engine.md).
  "bgg|cc/2006/218|20250101|1|art_45,art_46,art_74,art_75,art_93,art_98,art_100,art_113"
)

fehler=0
for e in "${EINTRAEGE[@]}"; do
  IFS='|' read -r name eli kons n anker <<<"$e"
  datei="/tmp/${name}.html"
  pfad="${eli//\//-}"
  url="${BASIS}/${eli}/${kons}/de/html/fedlex-data-admin-ch-eli-${pfad}-${kons}-de-html-${n}.html"
  code=$(curl -s -o "$datei" -w "%{http_code}" "$url")
  groesse=$(wc -c < "$datei" | tr -d ' ')
  if [ "$code" != "200" ] || [ "$groesse" -lt 40000 ]; then
    # Fallback: andere html-N-Varianten probieren
    ok=""
    for alt in 1 2 3 4 5; do
      url="${BASIS}/${eli}/${kons}/de/html/fedlex-data-admin-ch-eli-${pfad}-${kons}-de-html-${alt}.html"
      code=$(curl -s -o "$datei" -w "%{http_code}" "$url")
      groesse=$(wc -c < "$datei" | tr -d ' ')
      if [ "$code" = "200" ] && [ "$groesse" -gt 40000 ]; then ok="ja"; break; fi
    done
    if [ -z "$ok" ]; then
      echo "FEHLER  ${name}: kein Filestore-HTML gefunden (Konsolidierung ${kons} prüfen!)"
      fehler=$((fehler+1)); continue
    fi
  fi
  fehlend=""
  IFS=',' read -ra LISTE <<<"$anker"
  for a in "${LISTE[@]}"; do
    if ! grep -q "id=\"${a}\"" "$datei"; then fehlend="${fehlend} ${a}"; fi
  done
  if [ -n "$fehlend" ]; then
    echo "FEHLER  ${name} (${kons}, ${groesse} B): fehlende Anker:${fehlend}"
    fehler=$((fehler+1))
  else
    echo "OK      ${name} (${kons}) → ${datei} (${groesse} B), ${#LISTE[@]} Anker geprüft"
  fi
done

if [ "$fehler" -gt 0 ]; then
  echo; echo "${fehler} Gesetz(e) mit Problemen — Konsolidierungsstände im Quellen-Register prüfen."
  exit 1
fi
echo; echo "Alle Caches aktuell, alle Pflicht-Anker vorhanden."
