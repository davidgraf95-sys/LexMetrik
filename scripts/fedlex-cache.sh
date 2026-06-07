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
  # VVG: gepinnt 6.6.2026 (html-2!, 200 kB; Kündigungs-Maske 3 — 35a/b/c
  # + Zwingend-Kataloge 97/98 am Wortlaut verifiziert).
  "vvg|cc/24/719_735_717|20240101|2|art_35_a,art_35_b,art_35_c,art_97,art_98"
  # HRegV: gepinnt 6.6.2026 (Gründungs-Masken GmbH/AG; 20250101 = neuste
  # greifbare Konsolidierung, 1.7.2025/1.1.2026 liefern nur die SPA-Shell).
  # Beleg-Artikel 43/44/71/72 + Form (18/20/21/22/23/24a) + Domizil 117.
  "hregv|cc/2007/686|20250101|1|art_18,art_20,art_21,art_22,art_23,art_24_a,art_43,art_44,art_45,art_71,art_72,art_117"
  # GebV-HReg: gepinnt 6.6.2026 (HReg-Gebühren, Anhang Ziff. 1.3 = CHF 420;
  # ELI via SPARQL aufgelöst, 20210101 = einzige Konsolidierung; nur ~30 kB!).
  "gebv_hreg|cc/2020/180|20210101|1|art_3,art_4,art_8"
  # GebV SchKG: gepinnt 7.6.2026 (Bibliotheks-Standard S3-Nachzug — der
  # Betreibungskosten-Rechner nutzte einen Ad-hoc-Cache; ELI lt. Dossier
  # gebv-schkg-kostenrechner.md, Konsolidierung 1.1.2026).
  "gebv_schkg|cc/1996/2937_2937_2937|20260101|0|art_16,art_15_a"
  # StGB: gepinnt 7.6.2026 (S3-Nachzug — strafrecht-cluster.md nutzte einen
  # Ad-hoc-Cache ohne dokumentiertes ELI; 20260101 empirisch bestätigt,
  # html-2, 981 kB; Verjährung 97 ff., Antrag 30 ff.).
  "stgb|cc/54/757_781_799|20260101|2|art_30,art_97,art_98,art_101,art_109,art_333,art_389"
  # StG: gepinnt 6.6.2026 (Emissionsabgabe in den Gründungs-Masken:
  # Art. 8 Abs. 1 = 1 %, Art. 6 Abs. 1 lit. h = Freibetrag 1 Mio.;
  # 20240101 = neuste Konsolidierung).
  "stg|cc/1974/11_11_11|20240101|1|art_5,art_6,art_8"
)

fehler=0
for e in "${EINTRAEGE[@]}"; do
  IFS='|' read -r name eli kons n anker <<<"$e"
  datei="/tmp/${name}.html"
  pfad="${eli//\//-}"
  # n=0: Datei OHNE «-N»-Suffix (Spezialfall GebV SchKG, festgestellt 7.6.2026)
  if [ "$n" = "0" ]; then
    url="${BASIS}/${eli}/${kons}/de/html/fedlex-data-admin-ch-eli-${pfad}-${kons}-de-html.html"
  else
    url="${BASIS}/${eli}/${kons}/de/html/fedlex-data-admin-ch-eli-${pfad}-${kons}-de-html-${n}.html"
  fi
  code=$(curl -s -o "$datei" -w "%{http_code}" "$url")
  groesse=$(wc -c < "$datei" | tr -d ' ')
  # Schwelle 20 kB: SPA-Shell/Fehlerseiten sind ~9 kB bzw. ~77 kB OHNE Anker —
  # die Anker-Prüfung unten fängt grosse Blindgänger; kleinster echter Cache
  # ist die GebV-HReg mit ~30 kB (darum nicht mehr 40 kB).
  if [ "$code" != "200" ] || [ "$groesse" -lt 20000 ]; then
    # Fallback: andere html-N-Varianten probieren
    ok=""
    for alt in 1 2 3 4 5; do
      url="${BASIS}/${eli}/${kons}/de/html/fedlex-data-admin-ch-eli-${pfad}-${kons}-de-html-${alt}.html"
      code=$(curl -s -o "$datei" -w "%{http_code}" "$url")
      groesse=$(wc -c < "$datei" | tr -d ' ')
      if [ "$code" = "200" ] && [ "$groesse" -gt 20000 ]; then ok="ja"; break; fi
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
