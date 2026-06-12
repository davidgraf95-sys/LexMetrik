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
  # Re-Pin 20250101→20260101 (§7-Nachverifikation 7.6.2026): alle engine-
  # tragenden Artikel (46–53, 56, 63, 83–88, 166, 174, 250, 271–280) body-
  # identisch; einzige Normänderung Art. 230 (10→20 T., nicht verdrahtet),
  # neu art_222a (nicht verdrahtet). Anker +88/+166 (Verwirkungsfristen-Drift).
  "schkg|cc/11/529_488_529|20260101|1|art_17,art_46,art_56,art_63,art_84,art_88,art_166,art_272"
  "arg|cc/1966/57_57_57|20230901|1|art_9,art_12,art_13,art_46"
  # VMWG: Re-Pin 20250101→20251001 (§7-Nachverifikation 7.6.2026). Die alte
  # «nur SPA-Shell»-Annahme war FALSCH — die Datei liegt OHNE «-N»-Suffix
  # (n=0, Muster GebV SchKG). art_19_a existiert seit 1.10.2025 (V 21.3.2025,
  # AS 2025 191): Staffel-Mitteilung neu in 19a, Index-Teil bleibt in 19 II;
  # Art. 16/17 byte-identisch zu 20250101 (Teuerungs-Engine unberührt).
  "vmwg|cc/1990/835_835_835|20251001|0|art_16,art_17,art_19,art_19_a"
  # StPO-Anker um die Straf-Zuständigkeits-Pillen erweitert (6.6.2026).
  # Re-Pin 20240101→20250401 (§7-Nachverifikation 7.6.2026, Auslöser AS 2025
  # 178 [USG, nur Art. 269]): Gerichtsstands-Kaskade 31–42, Fristen/Wege
  # 301/354–357/381–402/410 f. wortidentisch; einzig Art. 393 I lit. c neu
  # gefasst (Sexualstrafrecht-Rev., AS 2024 27) — nur Fundstellen-Zitat.
  "stpo|cc/2010/267|20250401|1|art_31,art_129,art_301,art_379"
  # Re-Pin 20210101→20220701 (§7-Nachverifikation 7.6.2026): Art. 11/20
  # byte-identisch; einzige Änderung Art. 66 II lit. d (EGMR, AS 2022 289).
  # Künftige Konsolidierung 20270101 existiert, HTML noch leer — NICHT pinnen.
  "vwvg|cc/1969/737_757_755|20220701|1|art_11"
  # BGG: bisher Ad-hoc-Cache — seit 6.6.2026 reproduzierbar gepinnt (html-1
  # empirisch bestätigt; Grundlage bestimmeRechtsmittel + Dossier
  # bibliothek/recherche/bgg-beschwerde-engine.md).
  # Re-Pin 20250101→20260401 (§7-Nachverifikation 7.6.2026, Auslöser AS 2026
  # 99 = energierechtl. Beschleunigungserlass): nur Art. 83 z-bis/z-ter,
  # 117 II, 132b (Wasserkraft — nicht verdrahtet); ALLE engine-tragenden
  # Artikel (45–47, 51, 74, 75, 92 f., 98, 100, 113 ff.) wortidentisch.
  # ACHTUNG: Das ist NICHT die «kleine BGG-Revision» (Botschaft 5.12.2025) —
  # deren Monitoring im Verfallsregister bleibt offen!
  "bgg|cc/2006/218|20260401|1|art_45,art_46,art_74,art_75,art_93,art_98,art_100,art_113"
  # BGerR (Reglement für das Bundesgericht, SR 173.110.131): gepinnt 11.6.2026
  # für die Abteilungs-Auskunft (BGer-Rechtsweg-Ausbau; Vorverifikation
  # 7.6.2026 im Dossier behoerden/rechtsmittel-spruchkoerper-kantone.md §3 —
  # ELI cc/2006/834, Konsolidierung 1.2.2026, Filestore NUR ohne -N-Suffix;
  # seit 1.2.2026 ZWEI strafrechtliche Abteilungen Art. 35/35a, AS 2025 856).
  "bgerr|cc/2006/834|20260201|0|art_33,art_34,art_35,art_35_a,art_36"
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
  # Ad-hoc-Cache ohne dokumentiertes ELI; Verjährung 97 ff., Antrag 30 ff.).
  # Re-Pin 20260101→20260612 (terminiert, vollzogen 12.6.2026): AS 2026 231
  # (Eurodac/Schengen) ändert nur Art. 354/357 (nicht verdrahtet); alle
  # zitierten Artikel normtext-identisch, Anker-Inventar 477/477 stabil;
  # neue Datei liegt OHNE -N-Suffix (n=0, Muster GebV SchKG).
  "stgb|cc/54/757_781_799|20260612|0|art_30,art_97,art_98,art_101,art_109,art_333,art_389"
  # StG: gepinnt 6.6.2026 (Emissionsabgabe in den Gründungs-Masken:
  # Art. 8 Abs. 1 = 1 %, Art. 6 Abs. 1 lit. h = Freibetrag 1 Mio.;
  # 20240101 = neuste Konsolidierung).
  "stg|cc/1974/11_11_11|20240101|1|art_5,art_6,art_8"
  # KVG: gepinnt 11.6.2026 (KVG-Preset der Kündigungs-Maske 3 — Art. 7
  # Wechsel des Versicherers, Art. 64a Abs. 6 Ausstands-Sperre; 20260101 =
  # neuste echte Konsolidierung, 202602–202606 liefern nur die SPA-Shell;
  # Datei OHNE -N-Suffix. Dossier kvg-grundversicherung-kuendigung.md).
  "kvg|cc/1995/1328_1328_1328|20260101|0|art_7,art_62,art_64_a"
  # KVV: gepinnt 11.6.2026 (besondere Versicherungsformen: Art. 94 Abs. 2 /
  # Art. 100 Abs. 3 — Wechsel nur auf Jahresende, Fassung AS 2024 697).
  "kvv|cc/1995/3867_3867_3867|20260101|0|art_94,art_99,art_100"
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
