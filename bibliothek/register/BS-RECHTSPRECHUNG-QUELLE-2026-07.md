# BS-Rechtsprechung — Quelle, Regeln, Geltung (Vollimport seit 2022)

Dossier zur BS-Tranche des P3+-Slices (`FAHRPLAN-RECHTSPRECHUNG.md` §10;
Kurzfassung `FAHRPLAN-KANTONALE-ENTSCHEIDE.md` §7a; ROADMAP `W2·6-BS`).
Struktur nach CLAUDE.md §11 (5 Punkte).

## 1. Quelle + Stand

- **Amtliche Quelle:** Rechtsprechungs-Datenbank der Gerichte Basel-Stadt,
  `https://rechtsprechung.gerichte.bs.ch` (Vendor Findinfo/Weblaw, Omnis-CGI
  `JURISWEB`, `Schema=BS_FI_WEB`). Lizenz: Entscheide sind amtliche Werke,
  urheberrechtsfrei (Art. 5 URG, SR 231.1).
- **Abruf/Crawl:** 19.7.2026 (Inventar + Volltexte; `abgerufen` je Snapshot).
- **Mengengerüst beim Crawl (Portal-Zählung, festgeschrieben in
  `daten/bs-fiw/inventar.json`):** gesamt 10'846 Geschäfte (alle Jahre);
  Entscheiddatum 2022: **973** · 2023: **905** · 2024: **893** · 2025: **804** ·
  2026 (bis 19.7.): **148**; Scope-Summe (≥ 2022 inkl. 42 datumloser mit
  GN-Jahr ≥ 2022): **3'765 Dokumente**.
- **Gegenprobe entscheidsuche.ch (nur Zählung, Untergrenze):** Sitemap-Anker
  APG+SVG je Jahr 950/872/860/781/141 — Portal ≥ entscheidsuche in jedem Jahr ✓
  (Portal zählt zusätzlich Zivilgericht/Aufsichtskommission + datumlose).
  Deren Metadaten-Anreicherung wird NICHT übernommen (Lizenz-Leitplanke);
  Blockliste-Signal: 1 BS-Eintrag (AUS.2024.2) — massgeblich bleibt das Portal.
- **entscheidsuche-Permalink-Hinweis:** Findinfo-Portal-Links galten als
  session-/token-basiert; der hier benutzte Dokument-Link (Basis-Parameter +
  `Aufruf=getMarkupDocument&nF30_KEY=<key>&Template=search_result_document.html`)
  ist **session-frei reproduzierbar** (empirisch belegt 19.7.2026); Langzeit-
  Stabilität nur stichproben-belegt → Drift deckt der Delta-Lauf.

## 2. Deterministische Regeln (Eingabe → Ausgabe)

**URL-Templates** (`scripts/rechtsprechung/bs-client.ts`):

- Basis-Parameter (Pflicht, sonst 302): `OmnisPlatform=WINDOWS&WebServerUrl=
  rechtsprechung.gerichte.bs.ch&WebServerScript=/cgi-bin/nph-omniscgi.exe&
  OmnisLibrary=JURISWEB&OmnisClass=rtFindinfoWebHtmlService&OmnisServer=JURISWEB,7000&
  Schema=BS_FI_WEB&Parametername=WEB&cSprache=DE`
- Trefferliste: `…&Aufruf=validate&cTemplate=search_resulttable.html&
  cTemplate_ValidationError=search.html&evSubmit=Suchen&nAnzahlTrefferProSeite=999&
  nSeite={n}` (+ Datumsfenster `dEntscheiddatum={TT.MM.JJJJ}&bHasEntscheiddatumBis=1&
  dEntscheiddatumBis={TT.MM.JJJJ}`).
- Dokument: `…&Aufruf=getMarkupDocument&nF30_KEY={key}&Template=search_result_document.html`.

**Fallen (alle empirisch, 19.7.2026):**

| Falle | Regel |
|---|---|
| POST | liefert konstant 0 Treffer → NUR GET |
| `bInstanzInt_*`-Parameter | kastriert den Korpus auf ~30 AK-Treffer → NIE senden |
| Paging-Wrap | `nSeite` > letzte Seite liefert wieder Seite 1 → Abbruch über `ceil(N/999)` |
| 17-Byte-200er | Dokument-URL OHNE `Template=search_result_document.html` → Body `#ERROR-220511-003` bei HTTP 200 (Bauplan-Annahme «Minimal ohne Template» widerlegt); `W10_KEY`/`nTrefferzeile` bleiben unnötig (session-frei) |
| Query-Encoding | iso-8859-1-Prozent-Encoding (`encodeLatin1`), nie UTF-8 |
| Charset-Lüge | Header sagt `iso-8859-1`, Bodies tragen Windows-1252-Bytes (0x91/0x92 '' · 0x93/0x94 "" · 0x96 – · 0x85 …) → Dekodierung als **windows-1252** (WHATWG-/Browser-Semantik; strikt-latin1 ergäbe unsichtbare C1-Steuerzeichen) |
| Erfolg ≠ HTTP 200 | Gate je Response: 200 + `text/html` + Body > 2'000 B + kein `#ERROR`-Präfix + Inhalts-Marker («von N gefundenen» bzw. GN im Dokument) |

**Identität/Schlüssel:** fachlich = Geschäftsnummer + Entscheiddatum; technisch =
`nF30_KEY` (1 Dokument = 1 Key). `docketSafe` = GN verbatim; Kollision (mehrere
Dokumente je GN): zweites Dokument `GN-YYYYMMDD`, bei gleichem Datum zusätzlich
`-<nF30_KEY>` (deterministisch, Tor-geprüft).

**Instanz → court-Code** (Kopffeld «Instanz:», ausgeschrieben): Appellationsgericht →
`bs_appellationsgericht` · Sozialversicherungsgericht → `bs_sozialversicherungsgericht` ·
Zivilgericht → `bs_zivilgericht` · Aufsichtskommission über die Anwältinnen und
Anwälte → `bs_aufsichtskommission`. Unbekannter Wortlaut = harter Parse-Fehler (nie raten).

**Struktur-Parse** (`bs-parse.ts`, linkedom, absatz-strukturell): zwei
Dokument-Vokabulare — (a) semantische `aa*`-Klassen (v.a. Sozialversicherungsgericht):
`aaTatsachen`→Sachverhalt, `aaEntscheidungsgrnde`→Erwägungen, `aaDispositiv`→Dispositiv,
Marken aus `aaRmisch*`/`aaArabisch1*`; (b) Word-Klassen (v.a. Appellations-/Zivilgericht):
Marker-Absätze («Sachverhalt»/«Erwägungen»/«Demgemäss erkennt …»), Erwägungsnummern als
FÜHRENDES `<b>`-Element. Ehrlicher Fallback ohne jeden Marker: EIN flacher
erwaegung-Abschnitt. Dispositiv-Ziffern über die `://:`-Konvention. Deckblatt
(Briefkopf/Mitwirkende/Parteien) wird in P1 NICHT extrahiert (Folge-Einheit F3);
`rubrum.gegenstand` = amtlicher Betreff-Titel (KEINE Regeste — SG-Fehletikett-Lektion).

**Sachgebiet:** GN-Präfix → `Rechtsgebiet` (`entscheide-mapping.ts` `KANT_PRAEFIX`),
jede BS-Zeile an ≥3 echten Portal-Titeln verifiziert (Kleinst-Bestände MV/SG/K5/KR
an ALLEN existierenden Dokumenten + Kopf-Instanz); unsichere Präfixe (DGZ 18 ·
BO 3 Dok., gemischte Titel) bewusst ohne Eintrag → Repo-Default `'oeffentlich'`
(bestehende Adapter-Konvention; als Default deklariert, nicht behauptet).

**AK-Befund (19.7.2026):** AK-Geschäfte (Anwaltsaufsicht) tragen im Dokumentkopf
die Instanz **«Appellationsgericht»** (geprüft AK.2024.6, Kopf `AK.2024.6
(AG.2024.520)`) — massgeblich ist das Kopf-Feld (§3.1) → sie laufen unter
`bs_appellationsgericht`; der Code `bs_aufsichtskommission` bleibt als Weiche für
Dokumente, deren Kopf tatsächlich «Aufsichtskommission …» ausweist (im Scope-Crawl
19.7.2026: keine). GN-Präfixe können Ziffern tragen («K5.2023.13»).

**Typographie:** NBSP (0xA0/`&nbsp;`), «», –, Soft-Hyphens verbatim; nur
ASCII-Whitespace gemäss HTML-Semantik kollabiert. Deklarierte Ausnahmen: reine
NBSP-Filler-Absätze und NBSP-Padding direkt hinter Gliederungsnummern (Layout).

## 3. Geltungsbereich + Ausnahmen

- **Scope:** Entscheiddatum ≥ 01.01.2022 ODER datumlos mit GN-Jahr ≥ 2022; alle
  4 Instanzen. **Datumlose (42):** Platzhalter `<GN-Jahr>-01-01` + Feld
  `datumUnbekannt` (UI zeigt den Platzhalter nie als echtes Datum — Block B §7.2).
- **AK/AG-Überlapp:** AK-Geschäfte tragen parallele AG-Nummern; `nF30_KEY`-Dedupe
  verhindert Doppel-Import; primäre GN = Kopf-GN, Zweitnummer als `nummerSekundaer`.
- **Takedown-Regel:** massgeblich ist das Portal; beim Delta-Lauf verschwundene
  Scope-Einträge werden entfernt + im Report ausgewiesen.
- **Nicht in Scope:** Jahre vor 2022 (F1) · Normzitat-Extraktion (F2) ·
  Besetzung/Parteien/Kammer (F3) · Masse-DB-Angleichung (F4).

## 4. Pflegebedarf

- **Delta-Lauf:** `npm run entscheide:bs -- --delta` (Inventar neu, Diff: neue
  Keys fetchen, `aktualisiert`-Drift refetchen, Verschwundene entfernen).
  Kadenz: manuell/bei Bedarf; 2026 wächst (~148 → laufend), ~+30 MB/Jahr.
- **Budget:** `BUDGET_MB` = 1024 (David 19.7.2026); Tore `check:entscheide` +
  `check:bs-entscheide` (offline, in `check:seriell`).
- Roh-HTML (`daten/bs-fiw/raw/`, golden, ~250 MB) ist lokal/gitignored —
  Parser-Fixes brauchen nie Re-Crawl; Verlust kostet nur ~1 h Re-Crawl.

## 5. Abnahme-Status

Maschinell erfasst + doppelt verifiziert (Count-Gates dreifach, Fidelity-Gates,
netzfreie Fixture-Tests, Gegenprüfung QS-GP); `kuratierung: 'maschinell'`
durchgängig (nie `geprueft` — Abnahme-Zeitsperre bis 1.12.2026). Fachliche
Abnahme durch David: **offen** (nicht nachfragen/drängen). Anonymisierungs-Scan
(30 Zufallsdokumente, AHV/E-Mail/Telefon): Ergebnis siehe Abschnitt «Import-Lauf
19.7.2026» unten.

---

## Import-Lauf 19.7.2026 (Zahlenreport)

**Crawl:** 3'765/3'765 Dokumente geholt, 0 Fehler, 0 übersprungen (~90 min,
sequenziell ~1 req/s, resumierbar; Fehlerliste leer). **Parse:** 3'765/3'765,
0 unparsebar; Struktur-Quelle: aa*-Klassen 924 (24.5 %) · Word-Marker 2'841
(75.5 %) · flacher Fallback **0** → **100 % strukturiert** (Ziel ≥95 % übertroffen).
57 GNs mit Mehrfach-Dokumenten (≈1.5 %, Kollisionsregel §3.2 angewandt).

| Achse | Verteilung |
|---|---|
| Jahr (Entscheiddatum) | 2022: 973 · 2023: 905 · 2024: 893 · 2025: 804 · 2026: 148 · datumlos: 42 — **== Portal-Anker je Jahr (G1 ✓)** |
| Gericht | Appellationsgericht 2'839 (inkl. AK-Geschäfte, s. AK-Befund) · Sozialversicherungsgericht 924 · Zivilgericht 2 · Aufsichtskommission 0 |
| Sachgebiet (maschinell) | straf 1'224 · oeffentlich 994 · sozial-abgaben 902 · privat 645 |

**Count-Gates:** G1 Portal-N je Jahr == Inventar == Snapshots ✓ · G2 Gesamtlauf
10'846 Zeilen == N, Keys eindeutig ✓ · G3 entscheidsuche-Untergrenze
(950/872/860/781/141) ≤ Portal je Jahr ✓. **Grössen:** `public/rechtsprechung`
gesamt 241.9 MB (BS-Anteil 147 MB) ≤ Budget 1024 MB; `register.json` 7.53 MB
(gzip-Transfer **625 KB**).

**Fidelity-Stichprobe (10 deterministische Zufallsdokumente, raw ↔ Snapshot):**
ä/ü/«/»/– Snapshot ≤ raw ✓ in allen 10 (Differenzen = übersprungenes Deckblatt);
Erwägungs-Top-Marken-Kette lückenlos in allen 10; Dispositiv vorhanden wo im raw;
kein U+FFFD; Tabellen zeilenweise lesbar. NBSP-Präsenzquote korpusweit 100 %.
Hinweis: einzelne «Erwägungs-Top-Sprung»-Warnungen (z.B. SB.2020.63 5→8) stammen
aus amtlichen TEIL-Publikationen («Aus den Erwägungen») — Quelle, kein Parse-Verlust.

**Anonymisierungs-Scan (30 Zufallsdokumente, AHV/E-Mail/Telefon):** 1 Treffer =
`sirene@fedpol.admin.ch` (amtliche Behörden-Adresse fedpol/SIRENE, kein
Personendatum). AHV-Heuristik über den GANZEN Korpus (check:entscheide): 0 Treffer
in BS. BS publiziert amtlich anonymisiert (A____/B____-Schema) — bestätigt.

**Bauplan-Abweichungen (offengelegt):** (1) Dokument-URL braucht
`Template=search_result_document.html` (Bauplan-«Minimal ohne Template» lieferte
17-Byte-#ERROR). (2) Dekodierung windows-1252 statt «strikt latin1»
(C1-Bytes real vorhanden; Browser-Semantik). (3) AK-Geschäfte laufen unter
`bs_appellationsgericht` (Kopf-Instanz massgeblich, §3.1) — `bs_aufsichtskommission`
bleibt leer, solange kein Dokumentkopf «Aufsichtskommission …» ausweist.
(4) Fidelity-Zeichengleichheit über Inhalts-Zeichen (ä/ö/ü/«/»)
Einheiten↔Blöcke statt Byte-Eichung «minus Template-Anteil» (robuster, gleicher
Zweck); NBSP über Präsenz-Quote + Stichprobe. (5) U+2026-Excerpt-Tor in
`check:entscheide` auf Excerpt-Risiko-Quellen (OCL) beschränkt — BS-Urteile
enden z.T. verbatim amtlich auf «.…» (AUS.2026.4), kein Kappungs-Mechanismus
in dieser Pipeline. (6) Datumlose real 42 (Bauplan-Schätzung ~110).
