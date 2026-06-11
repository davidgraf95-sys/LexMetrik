# Archiv — rotierte STRUKTUR.md-Session-Karten

**Angelegt 11.6.2026** (FAHRPLAN-TOKEN-DISZIPLIN.md T-4): STRUKTUR.md wird in
jeder Session und jedem Subagenten gelesen; abgeschlossene Session-Karten
wandern darum BYTE-GENAU hierhin (Inhalt unverändert, nur verschoben).
Reihenfolge wie in STRUKTUR.md vor der Rotation (neueste zuerst). Künftige
Rotationen hängen NEUE Blöcke direkt unter diesem Kopf an.

---

## Session 10.6.2026 abends — STRUKTUR-UMBAU S-1–S-6 (Auftrag David)

**`FAHRPLAN-STRUKTUR-UMBAU.md` komplett umgesetzt** (10 Commits ab
`f7bbf07`; jede Etappe golden-gegated 87/87 byte-gleich): **S-1**
Deckblatt-Kacheln ganz klickbar (gestreckter Klickbereich, Direktlinks
separat) · **S-3** Zuständigkeit VIERTEILIG — Zivilprozess · Vollstreckung
(SchKG) · Strafverfahren · Verwaltungsverfahren (geplant, ehrlich) als
eigene Felder (`lib/zustaendigkeitKategorie.ts`; Kopf-Titel je Rechtsweg
via titelOverride; übersteuert E2-Konsolidierung; Zähler 33/29) · **S-2**
Vorlagen in FÜNF Gruppen (Behördeneingaben [Rubriken: Klagen allgemein =
Schlichtungsgesuch/vereinfacht/ordentlich (neu, geplant) · Klagen
besondere Konstellationen nach klageGebiet · Gesuche & sonstige Eingaben]
· Verträge · Einseitige Willenserklärungen [vorher korrespondenz; +
Vollmacht] · Gesellschaftsrecht · Vorsorge & Nachlass;
`lib/vorlagenKategorie.ts`) · **S-6** Gebühren zweigeteilt
prozessual/materiell + Hilfsrechner (`lib/gebuehrenKategorie.ts`, beide
Rubriken explizite Listen) · **S-5a** EINFACHER Fristenrechner zuoberst im
Tagerechner (Datum · Frist · Ferien-Wahl keine/ZPO/SchKG; reine
Engine-Komposition, Annahmen offen; `EinfacheFristForm.tsx`) · **S-5b**
Fristen-Kategorie prozessual (zpo/schkg) / materiell (5 Regimes) ·
**S-5c FRISTENSPIEGEL AUFGELÖST** — Ereignis-Blöcke
(`EreignisFristenSektion`, ex-FristenspiegelForm) leben in den
Fach-Rechnern (ZPO: Zivilentscheid+Klagebewilligung · SchKG:
Zahlungsbefehl · Erbrecht: Erbgang · Kündigung: 336b mit
Live-Beendigungs-Vorgabe via onBeendigung · Mietrecht zeigt 273-Fristen
selbst); `/rechner/fristenspiegel` = Redirect mit Query-Weiterreichung
(`FristenspiegelRedirect.tsx`; lib/fristenspiegel-Engines + Tests
UNVERÄNDERT) · **S-4** Zuständigkeit→Vorlagen-Sprung: SG-Brücke auf ALLE
Kantone (Kanton/PLZ/Gemeinde als Schlüssel → Vorlage setzt Adresse der
zuständigen Stelle als Adressat, `sgPrefillOrt`/`SgBehoerdenWahl`-
Startwerte); geteilter `VorlagenSprung`-Block in SchKG-/Straf-Rechtsweg.
**Bug-Check §9 (3 Lupen Code/Empirie/fachlich): 0 HOCH, 5 MITTEL + 6
NIEDRIG — alle gefixt** (`ce30b37`; Empirie: 10 Konstellationen
handgerechnet, 6/6 FSP-Round-Trips, Sweep 14'448 Komb.). Abnahme David
offen: Gruppen-/Rubrik-Zuordnungen S-2, prozessual/materiell S-5b/S-6
(Wackelkandidaten im Lupen-Bericht), WARUM-Sätze, Verwaltungs-Engine-
Priorität.

## Session 10.6.2026 nachmittags — Fristen-Einheit FE-1–FE-6 (DEPLOYED)

**Deployed + gepusht bis `a7adb98`** (Davids Ja «bug check und push und
deploy»; Asset-Hash live=lokal ✓, 7 Routen 200; **erster gelungener Push
seit dem PAT-Blocker: origin/main = a7adb98, 62 Commits** — CI-/Normen-
Monitor-Erstlauf auf GitHub noch zu verifizieren, Repo privat). Inhalt:
FAHRPLAN-FRISTEN-EINHEIT FE-1–FE-6 komplett — EIN Fristenrechner-Erlebnis:
Fristen-Kategorie mit zwei Haupteinstiegen + «Eigenes Regime»-Zeilen
(lib/fristenKategorie.ts; WARUM-Sätze = fachliche Aussagen, **Abnahme
David offen**) · Regime-Frage mit Weiche (Betreibungssache → Zivilgericht/
ZPO → sonst Allgemein; ehrliche Zeile «Nicht abgebildet: StPO/VwVG/BGG») ·
Preset-Such-Index über alle Regimes (lib/presetIndex.ts, 69 Einträge,
Round-Trip-getestet; SCHKG_LINK_SPEC geteilt in rechnerPermalinks.ts,
fristnatur-Sechserliste als deklarierter Fix) · Abzweigungen in beide
Richtungen · Mietrecht-Eckdaten auf EckdatenKachel (byte-identisch) ·
Goldliste +7. §9-Bug-Check (3 Agents) fixte 2 HOCH (Teilen-Klick
remountete die Tagerechner-Form; Weiche schickte StPO/VwVG/BGG-Fristen in
den ZPO-Stillstand). Details: FAHRPLAN-FRISTEN-EINHEIT.md.

**Voll-Audit 5.6.2026** (4 parallele Agenten: Engines, Vorlagen, UI, Daten/Infra):
Fixes `21446ac`…`b8c9312` — PDF-Freitext-Datumsverdrehung (H1), Block-
Seitenüberlauf (H2), Testament-Quoten, PV-R6-Normalisierung, Mietvertrag-G3,
sperrfristen-Union bei Nichtigkeit, tsconfig strict, fedlex-Kombi-Anker.
Offen (UX-Politur, kein Output-Fehler): stabile Keys in 7 Listen-Editoren.

**Stand:** 5. Juni 2026 — deployed bis `1a69a93` (… + Katalog-Ausbau
Free/Pro 111 Karten, Vorlagen 5+6 Arbeits-/Mietvertrag, Formatvorlagen-
Renderer, Tagerechner; Bug-Check: 2 Review-Agents, 1 HOCH-Befund
Toggle-Kopplung gefixt).
**Produktion:** https://lexmetrik.vercel.app (Vercel-Projekt `lexmetrik`;
`legal-calc.vercel.app` = 308-Redirect). Marke: **LexMetrik** (grosses M).

## Session 7.6.2026 abends — Betreibungsamt-Finder (Auftrag David, ungepusht)

Auf Davids Frage zum EasyGov-Finder («kann ich das?») + «bau»: **Recherche-
Dossier** `behoerden/betreibungskreise-kantone.md` (52 Agents, je Kanton
adversarial: 10 Einheitsamt · 10 Bezirks-/Regional · 2 Gemeinde · 4 gemischt;
Negativbefund: kein offenes Bundes-Verzeichnis, EasyGov-Detail-API geschützt) ·
**Datenschicht** `data/betreibungsaemter.ts` (einheitsamt/kreise/verzeichnis,
§8) + `data/betreibung/` (Resolver + Gemeinde-Karten 8 Kt./981 Gemeinden,
gegen swisstopo-Register normalisiert; ZH-Städte → Stadtkreis-Listen 12/3) ·
**UI** SchKG-Rechner Sektion 3b (PLZ→Kanton+Gemeinde) + Amts-Anzeige in der
Forum-Karte (EasyGov bleibt Zweitweg). Extraktion per Workflow, Adress-
Stichproben durchwegs zeichengenau bestätigt. Bug-Check §9 (2 Agents): 1 HOCH
gefixt (3b-Ortshinweis folgt jetzt der Engine-Weiche — Grundpfand=Grundstücks-
ort, nicht Wohnsitz). **Etappen 1–3 FERTIG (Commits `bb3adba`…`ae8730f`):**
13 Kantone gemeindescharf (ZH/FR/SO/AR/GR/TG/TI/VD + ZG/UR/SZ; 130 Kreis-Ämter,
Karten 11 Kt.), 10 Einheitsämter direkt, BE/VS Dienststellen-Liste, **LU/AG/SG
bewusst Verzeichnis-Link (§8: keine belastbare amtliche Gesamtliste — LU
Verbands-Plattform/Fusionen, AG ~14/19 Kreise [Verbands-URL tot], SG
Negativbefund)**. 26 Akzeptanztests; Suite 1090. PFLEGE: ZH-Kreis-
Reorganisation in Vernehmlassung (Verfallsregister halbjährlich); BE «Avenir
Berne romande» (Moutier 1.1.2026); ZG-PDF Stand 2/2023.
**OFFEN: Davids fachliche Abnahme · Push/Deploy-Ja · Verbesserungspotential**
(siehe Memory/HANDLUNGSPLAN): LU/AG/SG-Vollerfassung wenn amtliche Liste
verfügbar; SG-Gemeinde-Vollerfassung (~75 dezentrale Adressen); PLZ-Feld
in 3b könnte die Gemeinde-Mehrdeutigkeit (mehrere Gemeinden je PLZ) als
Auswahl statt Hauptgemeinde-Default anbieten.

## Session 7.6.2026 nachts — Plan 9b VOLLDOKUMENTE Gründung (Aufträge David, ungepusht)

**Wortlaut-Dossier** `recherche/gruendungsdokumente-wortlaute.md` (4 Muster-
Sweeps: EHRA/ZH/SG/GL + Zeichnungs-/Erklärungs-/Anmeldemuster, alles lokal
geparst; Norm-Kerne am OR-Cache 1.1.2026 — Anweisung David: NEUSTES Recht;
§7-Korrektur: Art. 806b OR gilt weiter, gmbh-gruendung.md berichtigt). ·
**GmbH-Dokumentmappe** (`lib/vorlagen/gruendungGmbhDokumente.ts` + Komponente):
Statuten + Errichtungsakt als ENTWURF-Gate (§8), Wahlannahme/Domizil/
Beschlüsse/HR-Anmeldung druckfertig; Dokument-Auslöser aus
gruendungsunterlagen.ts (§5); Gates 773/774/777 II/795 II; Erstausbau nur
Bargründung CHF (ehrlich gesperrt sonst). · **AG-Dokumentmappe** analog
(`gruendungAgDokumente.ts`): VR-Protokoll als Pflichtbeleg, Teilliberierung
632 (≥ 20 %/≥ 50k-Gates), Vinkulierungs-/701d-Klauseln. **PERFEKTIONS-
PROGRAMM 7.6.2026 ABGESCHLOSSEN** (Auftrag David; Detail
FAHRPLAN-AG-GRUENDUNG.md, alle Normen am OR-/HRegV-Cache): Stufe-2-
Kombinationen frei (qualifiziert+FW in Kapitalwährung · Agio voll bei
Teilliberierung · Wert-Gates auf Ausgabebetrag · gemischte
Teilliberierung) · Inhaberaktien-Weiche (622 1bis/2bis, Gates 683/685a) ·
Statuten-Zusatzklauseln (Schiedsklausel 697n, Kapitalband 653s ff.,
bedingtes Kapital 653 ff., Stichentscheid-Abwahl, erstes GJ) ·
Unterschriftenblatt (Art. 21 HRegV) in jeder Mappe · ZIP-Sammeldownload
(PDF+DOCX, fflate) · localStorage-Persistenz mit Hydration-Guards ·
Vorschau-Wahl/Musterdaten/Schritt-Feldmarkierung · Notariatsgebühren
kantonsabhängig (lib/notariatsgebuehrenGruendung.ts, ZH/BE/LU/SG/BS
deterministisch, AG nach Aufwand; Dossier kosten/) · Abnahme-Dossier
ABNAHME-AG-BAUSTEINE.md (scripts/abnahme-ag.ts, 194 Bausteine, 13
Schemas — Davids Wort-für-Wort-Abnahme) · Kantonsvergleich SG/GL
(kantonsneutral bestätigt) · HR-Ämter-Adressdossier 26 Kt. Sweep-Stufe-
2-Strang (3264 AG-Komb., Exit-Fix) + Golden 87. Sammel-Bug-Check §9:
2 MITTEL gefixt, 0 HOCH. OFFEN: Stimmrechts-/Vorzugsaktien/PS
(Zwei-Kategorien-Kapitalmodell, Davids Entscheid) · arithmetische
Sweep-Geld-Invariante · Erstrecherche-Verifikationen Notariatstarife. · **Notariate je Kanton** (Auftrag David): Dossier
`behoerden/notariate-kantone.md` + Stammdaten `lib/notariate.ts` + Link-Box
in beiden Masken (SH-Sonderregel: HRegA beurkundet; UR/AI/BL «ohne Gewähr»).
· **Bug-Check §9 bestanden:** Code-Agent (2304 Kombinationen empirisch,
0 HOCH) + Jurist-Agent (1 HOCH: 805-V-Ziff.-2bis-Anker → 701d, gefixt;
M-Befunde eingearbeitet: Wahlannahme-Index-IDs, 626-Ziff.-3-Einlagebetrag,
Begründungs-Klarstellungen, CHF-Placeholder). Tests 975 grün (+22 neu),
tsc/Lint/Build sauber. Katalog: beide Gründungs-Karten neu mit
output pdf+docx. · **Kapitalerhöhung 9c GEBAUT** (gleiche Nacht): Dossier
`recherche/kapitalerhoehung-wortlaute.md` + Maske
`/vorlagen/kapitalerhoehung` (AG/GmbH-Schalter; Beschluss-/Feststellungs-
Urkunden ENTWURF, Zeichnungsscheine/Bericht/Anmeldung fertig;
6-Monats-Verfalls-Gates; 781-Verweisketten; Katalog 35). Bug-Check §9:
2 Agents, 0 HOCH, M/N-Befunde eingearbeitet; 985 Tests grün.

## Session 6.6.2026 abends (`8652e6b`…`4781ca7`, Aufträge David — ungepusht)

**Art.-63-SchKG-Doppelfix** (fristenEngine.ts): (1) Fristende Sa/So unmittelbar
vor Betreibungsferien — Werktagsverschiebung führte IN die Ferien (Repro
13.7.2024 → 15.7. statt 6.8.); (2) Review-Befund M-1: 3. Werktag nach
Ferienende kann in separaten Rechtsstillstand fallen → Normalisierung jetzt
Schleife bis stabil. 5 Regressionstests, Wortlaut am Cache. ·
**Feiertage-Doppelcheck 26/26** gegen die BJ-Liste (eigenständig am PDF):
7 Korrekturen (LU-Berchtold, GL-Allerheiligen, GL/VS-Stephanstag,
JU-Pfingstmontag, FR-Empfängnis, AI-Mauritius), **bedingte Feiertage** als
`giltImJahr` (NE-Fn.-10, UR/AR/AI-Fn.-1/7/9), **Näfelser-Fahrt-Karwoche-
Regel** (2026: 9.4.!); 2 Alttests trugen die falsche Matrix (deklariert
korrigiert); Regelwerk `bibliothek/normen/feiertage-kantone-bj.md`. ·
**Katalog-Split Zuständigkeit:** eigene Gebiets-Einstiege schkg-/straf-
zustaendigkeit (Hash-Vorauswahl #schkg/#straf, Muster Kuendigung;
istVerfuegbar 21→23). · **Rechtsmittel-Fahrplan (Zivil):** bestimmeRechtsmittel
mit Objekt-/Verfahrens-/Vorinstanz-Weichen (308/319/314 Abs. 2 Rev. 2025!/
321/145 Abs. 2 lit. b ZPO · 74/75 Abs. 2/46 Abs. 2 lit. a/92 f./98/100 BGG),
strukturierte Fristen je Ebene (Tage + Stillstand), Weichen/Kognition
offengelegt; UI als 4-Schritte-Fahrplan; Grundlage Dossier
bgg-beschwerde-engine.md. · **CLAUDE.md §11** (Wissens-Ablage, Anweisung
David) + Bibliothek komplettiert (45 Dossiers/5 Ordner, BGG-Cache in
fedlex-cache.sh reproduzierbar gepinnt, Register nachgeführt). ·
**Neue Dossiers:** eheschutz-glg-zustaendigkeit (Art. 198 lit. a! 314 Abs. 2
30 T.!), bgg-beschwerde-engine (Decision-Tree A–F), feiertage-kantone-bj. ·
**Gesamt-Check:** 2 unabhängige Review-Agents (Code + juristische Hand-
rechnung am Wortlaut) — alle Punkte bestätigt, M-1 gefixt, N-1 im Backlog. ·
**HANDLUNGSPLAN.md** neu (priorisiertes Vorgehen A–D). Offen: Davids
Push-Ja (10 Commits), Abnahmen, Hosting/Zahlung.

## Session 6.6.2026 nachmittags (Audit-Fixes + Ausbau, `021c05a`…`3e08ef1`)

Auf Davids laufende Aufträge: **Backlog B1–B10 komplett gefixt** (336c-
Tatbestände cbis/cter/cquinquies + Niederkunfts-Berechnung; Wechselbetreibung
`modus:'kein'` Art. 56 Ziff. 2; JStPO-Checkbox; ErrorBoundary+Export-Catches;
KTG-Risiken; Fraunces self-host+CSP+Cache-Header; Adress-SSoT BS golden-
bewiesen; tageTotal; 137-II-Variante) · **PLZ-Fixes** (21 tote Lookup-Pfade
via namensKandidaten(); Hauptgemeinde per amtlichem Adressenanteil — 4052
zeigt Basel 97.7 %) · **NEU Erb-Fristen-Rechner** (/rechner/erb-fristen, 15
Tatbestände 521/533/567 ff., Karte entwurf, Zählung 21) · **NEU Straf-
Rechtsmittel** (lib/strafRechtsmittel.ts, dritte Eingangs-Gabelung im Straf-
Rechtsweg; 222 rev. 2024!) · **Strafgerichts-Adressen** (data/strafgerichte.ts
26/26, Berufung §5-projiziert aus obereInstanzen; BL amtlich Grenzacher-
strasse 8 Muttenz) · **Hero je Rechtsweg** · **Schlichtungsstellen-Direktlinks**
(48/85 WebFetch-verifiziert + UI) · **Behörden-Voll-Audit: 0 Adressfehler**,
7 tote URLs ersetzt, Betreibungsämter-Verzeichnis → EasyGov (alte BJ-URL 404) ·
**Tiefencheck Engine** (8'442 Fälle: Scheidung×Art.-8-Naht + behoerdeTyp-Gate
gefixt, alles übrige entwarnt) · **Art. 5 Abs. 2 ergänzt**, lit. e/g–i
vollständig · **Art.-114-Spiegelung** Entscheidverfahren (lit. a/c/g) ·
**Kosten nicht-vermögensrechtlich** 26/26 + Familie (14 Kantone) in Daten+UI ·
**NEU Untermietvertrag-Weiche** (Art. 262 GELTENDE Fassung — Revision in der
Volksabstimmung 24.11.2024 abgelehnt!; Hauptmiete golden byte-identisch) ·
**Zahlungssystem-Entscheid:** PayPal aus der Planung entfernt (System offen).
**Recherche:** 17 Dossiers in `bibliothek/recherche/` (12 Engine-Cluster +
StPO-Rechtsmittel, Strafbefehlsverfahren, Gebühren-nv, Kündigungs-Masken,
Untermietvertrag) + `strafgerichte-kantone.md`/`schlichtungsstellen-urls.md` —
alle Erstrecherche/einfach belegt, fachliche Abnahme ausstehend.
Konsolidierter Befund-Stand: `fundamentalanalyse-2026-06-06.md`. Offen für
David: Dienstjahr-Stichtag-Grundsatzfrage · TI-Agno-Adresse · Abnahmen.

## Verschlankung 5.6.2026 (verhaltensneutral, Review ohne Befunde)

**Code-Splitting:** Alle Routen `React.lazy` (App.tsx, Suspense in der
Shell); jsPDF wird erst beim PDF-Klick geladen (dynamic import, Muster wie
DOCX). Hauptbundle **1'187 → 230 kB** (gzip 349 → 71); jede Seite eigener
Chunk. Banner-Texte/-Typ dafür nach `lib/vorlagen/banner.ts` gelöst
(vorlagenPdf re-exportiert).

**Geteilte Wizard-Infrastruktur** (für die Skalierung auf 50+ Vorlagen):
`components/vorlagen/useWizardState.ts` (Antworten + optionale
localStorage-Sicherung mit `normalisieren`-Callback, Schritt, Gate-,
Kopier-State; ohne `speicherKey` garantiert storage-frei → Schlichtung BS)
· `lib/vorlagen/vorlagenText.ts` (`dokumentAlsText` — dritter Renderer
neben PDF/DOCX aus derselben Quelle) · `Field`/`Stepper`/`inputCls` überall
aus `components/vorlagen/ui.tsx` (10 lokale Kopien entfernt; Typografie auf
body-s-Label/xs-Hint vereinheitlicht) · `lib/kantone.ts` (zentrale
KANTONE-Liste, amtliche Reihenfolge; bewusst abweichende Listen blieben
lokal).

**Generischer Wizard-Rahmen** (`components/vorlagen/wizard.tsx`):
`VorlagenWizardRahmen` (Kopf mit Rückweg/Normen/Badge/Speicher-Fussnote,
Stepper, zweispaltiges Layout, Fehlerbox, Zurück/Weiter; `weiterDeaktiviert`
überschreibbar für Stopp-Karten) · `VorschauPanel` (Live-«Papier» +
Bausteinprotokoll; `kompakt`, `extra`-Slot z. B. Pflichtteile,
`nichtAufgenommen`-Liste) · `ExportLeiste` (PDF/DOCX lazy + Kopieren;
DOCX nur wo Formvorschrift es zulässt). **Eine neue Vorlage liefert nur
noch: Schema (lib/vorlagen/), SCHRITTE, fehlerImSchritt, Schritt-Inhalte,
Gates-Anzeige im Prüfen-Schritt und die Rahmen-Props.** Die 4 Seiten sind
323–479 LOC (vorher 451–587). Session-Bilanz: −585 LOC netto, Hauptbundle
−80 %; alles verhaltensneutral (2 unabhängige Reviews ohne Befunde,
SSR-Smoke aller Seiten, Tests/Lint unverändert grün).

## Session-Abschluss 6.6.2026 (deployed bis e97f63b)

PLZ→Stelle: 8 Kantone gemeindescharf + BE/NE/JU zentral; SO/VS/TI/AR
ehrlich Verzeichnis (Gemeinde-/Circolo-Organe). Eingangs-Gabelung
Einleitung/Rechtsmittel. Gerichtsgebühren-Tiefenerfassung 26/26
(bibliothek/kosten/gerichtskosten-kantone.md; SH→JG 173.200 korrigiert).
Erlass-Links 52/52 in der UI. Verwaltungsbehörden-Dossier 26/26
zweifach geprüft. Adress-Gesamtprüfung (4 Pakete, ~450 Adressen):
7 Korrekturen eingearbeitet (u. a. AG-HG Vorstadt 40, BE-GenStA
Nordring 8, GR-VGer Grabenstrasse 30). Norm-Doppelcheck Stufe 1+2
abgeschlossen (Art.-5-lit.-d-Alternative, 112 IV Kann). Werkzeuge neu:
scripts/logik-sweep.ts · scripts/norm-zitate-pruefen.ts.

